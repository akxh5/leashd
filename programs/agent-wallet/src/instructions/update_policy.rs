use anchor_lang::prelude::*;
use crate::state::wallet_config::WalletConfig;
use crate::errors::AgentWalletError;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdatePolicyArgs {
    pub max_tx_amount: Option<u64>,
    pub daily_limit: Option<u64>,
    pub window_duration: Option<i64>,
    pub cooldown_seconds: Option<i64>,
    pub allowlist: Option<Vec<Pubkey>>,
}

#[derive(Accounts)]
pub struct UpdatePolicy<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"wallet_config", owner.key().as_ref()],
        bump = wallet_config.bump,
        has_one = owner @ AgentWalletError::Unauthorized,
    )]
    pub wallet_config: Account<'info, WalletConfig>,
}

pub fn handle_update_policy(ctx: Context<UpdatePolicy>, args: UpdatePolicyArgs) -> Result<()> {
    let wallet_config = &mut ctx.accounts.wallet_config;

    if let Some(max_tx_amount) = args.max_tx_amount {
        wallet_config.max_tx_amount = max_tx_amount;
    }
    if let Some(daily_limit) = args.daily_limit {
        wallet_config.daily_limit = daily_limit;
    }
    if let Some(window_duration) = args.window_duration {
        wallet_config.window_duration = window_duration;
    }
    if let Some(cooldown_seconds) = args.cooldown_seconds {
        wallet_config.cooldown_seconds = cooldown_seconds;
    }
    if let Some(allowlist) = args.allowlist {
        require!(allowlist.len() <= 10, AgentWalletError::AllowlistFull);
        wallet_config.allowlist = allowlist;
    }

    require!(wallet_config.daily_limit >= wallet_config.max_tx_amount, AgentWalletError::InvalidLimitConfig);

    emit!(PolicyUpdated {
        owner: ctx.accounts.owner.key(),
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct PolicyUpdated {
    pub owner: Pubkey,
    pub timestamp: i64,
}
