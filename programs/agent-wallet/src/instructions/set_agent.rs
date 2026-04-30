use anchor_lang::prelude::*;
use crate::state::wallet_config::WalletConfig;
use crate::errors::AgentWalletError;

#[derive(Accounts)]
pub struct SetAgent<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"wallet_config", owner.key().as_ref()],
        bump = wallet_config.bump,
        has_one = owner @ AgentWalletError::Unauthorized,
    )]
    pub wallet_config: Account<'info, WalletConfig>,
}

pub fn handle_set_agent(ctx: Context<SetAgent>, new_agent: Pubkey) -> Result<()> {
    let wallet_config = &mut ctx.accounts.wallet_config;
    wallet_config.agent = new_agent;
    Ok(())
}
