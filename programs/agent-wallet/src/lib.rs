use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

pub use instructions::*;

declare_id!("HzUhxgap8Jr8wSq8Q8jQBPxFAgXYSbbp3XC6uuGN3qbR");

#[program]
pub mod agent_wallet {
    use super::*;

    pub fn initialize_wallet(ctx: Context<InitializeWallet>, args: InitializeWalletArgs) -> Result<()> {
        handle_initialize_wallet(ctx, args)
    }

    pub fn execute_transfer(ctx: Context<ExecuteTransfer>, amount: u64) -> Result<()> {
        handle_execute_transfer(ctx, amount)
    }

    pub fn execute_token_transfer(ctx: Context<ExecuteTokenTransfer>, amount: u64) -> Result<()> {
        handle_execute_token_transfer(ctx, amount)
    }

    pub fn update_policy(ctx: Context<UpdatePolicy>, args: UpdatePolicyArgs) -> Result<()> {
        handle_update_policy(ctx, args)
    }

    pub fn set_agent(ctx: Context<SetAgent>, new_agent: Pubkey) -> Result<()> {
        handle_set_agent(ctx, new_agent)
    }

    pub fn toggle_freeze(ctx: Context<ToggleFreeze>) -> Result<()> {
        handle_toggle_freeze(ctx)
    }
}
