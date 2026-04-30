use anchor_lang::prelude::*;

#[error_code]
pub enum AgentWalletError {
    #[msg("Wallet is currently frozen")]
    WalletFrozen,
    #[msg("Unauthorized agent")]
    UnauthorizedAgent,
    #[msg("Transaction amount exceeds limit")]
    ExceedsTransactionLimit,
    #[msg("Recipient is not in the allowlist")]
    RecipientNotAllowed,
    #[msg("Cooldown period has not elapsed")]
    CooldownNotElapsed,
    #[msg("Daily spending limit exceeded")]
    ExceedsDailyLimit,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Allowlist is full")]
    AllowlistFull,
    #[msg("Invalid limit configuration")]
    InvalidLimitConfig,
}
