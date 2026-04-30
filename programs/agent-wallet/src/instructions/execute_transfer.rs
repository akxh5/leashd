use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::wallet_config::WalletConfig;
use crate::errors::AgentWalletError;

#[derive(Accounts)]
pub struct ExecuteTransfer<'info> {
    pub agent: Signer<'info>,
    /// CHECK: used only for PDA seed derivation
    pub owner: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"wallet_config", owner.key().as_ref()],
        bump = wallet_config.bump,
        has_one = agent @ AgentWalletError::UnauthorizedAgent,
    )]
    pub wallet_config: Account<'info, WalletConfig>,
    /// CHECK: recipient is validated against allowlist in handler
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handle_execute_transfer(ctx: Context<ExecuteTransfer>, amount: u64) -> Result<()> {
    let wallet_config = &mut ctx.accounts.wallet_config;
    let bump = wallet_config.bump;
    let wallet_config_info = wallet_config.to_account_info();
    
    // 1. require!(!wallet_config.is_frozen, AgentWalletError::WalletFrozen)
    require!(!wallet_config.is_frozen, AgentWalletError::WalletFrozen);
    
    // 2. require!(amount <= wallet_config.max_tx_amount, AgentWalletError::ExceedsTransactionLimit)
    require!(amount <= wallet_config.max_tx_amount, AgentWalletError::ExceedsTransactionLimit);
    
    // 3. require!(wallet_config.allowlist.contains(&ctx.accounts.recipient.key()), AgentWalletError::RecipientNotAllowed)
    require!(wallet_config.allowlist.contains(&ctx.accounts.recipient.key()), AgentWalletError::RecipientNotAllowed);
    
    // 4. let clock = Clock::get()?;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    
    // 5. Cooldown check
    if wallet_config.last_tx_timestamp != 0 {
        require!(
            now - wallet_config.last_tx_timestamp >= wallet_config.cooldown_seconds,
            AgentWalletError::CooldownNotElapsed
        );
    }
    
    // 6. Rolling window reset + daily limit check
    if now - wallet_config.window_start >= wallet_config.window_duration {
        wallet_config.spent_in_window = 0;
        wallet_config.window_start = now;
    }
    require!(
        wallet_config.spent_in_window + amount <= wallet_config.daily_limit,
        AgentWalletError::ExceedsDailyLimit
    );
    
    // 7. CPI transfer — PDA is the vault, use new_with_signer
    let owner_key = ctx.accounts.owner.key();
    let seeds = &[
        b"wallet_config",
        owner_key.as_ref(),
        &[bump],
    ];
    let signer_seeds = &[&seeds[..]];
    
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: wallet_config_info,
            to: ctx.accounts.recipient.to_account_info(),
        },
        signer_seeds,
    );
    system_program::transfer(cpi_ctx, amount)?;
    
    // 8. Update state
    wallet_config.spent_in_window += amount;
    wallet_config.last_tx_timestamp = now;
    
    // 9. Emit event
    emit!(TransferExecuted {
        agent: ctx.accounts.agent.key(),
        recipient: ctx.accounts.recipient.key(),
        amount,
        spent_in_window: wallet_config.spent_in_window,
        timestamp: now,
    });
    
    Ok(())
}

#[event]
pub struct TransferExecuted {
    pub agent: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub spent_in_window: u64,
    pub timestamp: i64,
}
