use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct WalletConfig {
    pub owner: Pubkey,
    pub agent: Pubkey,
    pub is_frozen: bool,
    pub max_tx_amount: u64,
    pub daily_limit: u64,
    pub spent_in_window: u64,
    pub window_start: i64,
    pub window_duration: i64,
    pub cooldown_seconds: i64,
    pub last_tx_timestamp: i64,
    #[max_len(10)]
    pub allowlist: Vec<Pubkey>,
    pub bump: u8,
}
