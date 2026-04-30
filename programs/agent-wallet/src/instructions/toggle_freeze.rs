use anchor_lang::prelude::*;
use crate::state::wallet_config::WalletConfig;
use crate::errors::AgentWalletError;

#[derive(Accounts)]
pub struct ToggleFreeze<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"wallet_config", owner.key().as_ref()],
        bump = wallet_config.bump,
        has_one = owner @ AgentWalletError::Unauthorized,
    )]
    pub wallet_config: Account<'info, WalletConfig>,
}

pub fn handle_toggle_freeze(ctx: Context<ToggleFreeze>) -> Result<()> {
    let wallet_config = &mut ctx.accounts.wallet_config;
    wallet_config.is_frozen = !wallet_config.is_frozen;
    
    let clock = Clock::get()?;
    emit!(WalletFreezeToggled {
        owner: ctx.accounts.owner.key(),
        is_frozen: wallet_config.is_frozen,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

#[event]
pub struct WalletFreezeToggled {
    pub owner: Pubkey,
    pub is_frozen: bool,
    pub timestamp: i64,
}
