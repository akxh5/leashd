use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::wallet_config::WalletConfig;
use crate::errors::AgentWalletError;

#[derive(Accounts)]
pub struct ExecuteTokenTransfer<'info> {
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
    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn handle_execute_token_transfer(ctx: Context<ExecuteTokenTransfer>, amount: u64) -> Result<()> {
    let wallet_config = &mut ctx.accounts.wallet_config;
    let bump = wallet_config.bump;

    require!(!wallet_config.is_frozen, AgentWalletError::WalletFrozen);
    
    // For simplicity, we use the same SOL limits for tokens (assuming 1:1 or just raw amount for demo)
    // In a real app, you'd have separate token limits.
    require!(amount <= wallet_config.max_tx_amount, AgentWalletError::ExceedsTransactionLimit);
    
    require!(wallet_config.allowlist.contains(&ctx.accounts.to_token_account.owner), AgentWalletError::RecipientNotAllowed);

    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    // Cooldown check
    if wallet_config.last_tx_timestamp != 0 {
        require!(
            now - wallet_config.last_tx_timestamp >= wallet_config.cooldown_seconds,
            AgentWalletError::CooldownNotElapsed
        );
    }

    // Daily limit check
    if now - wallet_config.window_start >= wallet_config.window_duration {
        wallet_config.spent_in_window = 0;
        wallet_config.window_start = now;
    }
    require!(
        wallet_config.spent_in_window + amount <= wallet_config.daily_limit,
        AgentWalletError::ExceedsDailyLimit
    );

    // CPI transfer
    let owner_key = ctx.accounts.owner.key();
    let seeds = &[
        b"wallet_config",
        owner_key.as_ref(),
        &[bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.from_token_account.to_account_info(),
        to: ctx.accounts.to_token_account.to_account_info(),
        authority: wallet_config.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
    token::transfer(cpi_ctx, amount)?;

    wallet_config.spent_in_window += amount;
    wallet_config.last_tx_timestamp = now;

    Ok(())
}
