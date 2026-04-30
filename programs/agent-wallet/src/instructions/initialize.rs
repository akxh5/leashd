use anchor_lang::prelude::*;
use crate::state::wallet_config::WalletConfig;
use crate::errors::AgentWalletError;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeWalletArgs {
    pub agent: Pubkey,
    pub max_tx_amount: u64,
    pub daily_limit: u64,
    pub window_duration: i64,
    pub cooldown_seconds: i64,
    pub allowlist: Vec<Pubkey>,
}

#[derive(Accounts)]
pub struct InitializeWallet<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + WalletConfig::INIT_SPACE,
        seeds = [b"wallet_config", owner.key().as_ref()],
        bump
    )]
    pub wallet_config: Account<'info, WalletConfig>,
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_wallet(ctx: Context<InitializeWallet>, args: InitializeWalletArgs) -> Result<()> {
    require!(args.max_tx_amount > 0, AgentWalletError::InvalidLimitConfig);
    require!(args.daily_limit >= args.max_tx_amount, AgentWalletError::InvalidLimitConfig);
    require!(args.allowlist.len() <= 10, AgentWalletError::AllowlistFull);
    require!(args.cooldown_seconds >= 0, AgentWalletError::InvalidLimitConfig);

    let clock = Clock::get()?;
    let wallet_config = &mut ctx.accounts.wallet_config;

    wallet_config.owner = ctx.accounts.owner.key();
    wallet_config.agent = args.agent;
    wallet_config.is_frozen = false;
    wallet_config.max_tx_amount = args.max_tx_amount;
    wallet_config.daily_limit = args.daily_limit;
    wallet_config.window_duration = args.window_duration;
    wallet_config.cooldown_seconds = args.cooldown_seconds;
    wallet_config.spent_in_window = 0;
    wallet_config.window_start = clock.unix_timestamp;
    wallet_config.last_tx_timestamp = 0;
    wallet_config.allowlist = args.allowlist;
    wallet_config.bump = ctx.bumps.wallet_config;

    Ok(())
}
