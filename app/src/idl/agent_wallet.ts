/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/agent_wallet.json`.
 */
export type AgentWallet = {
  "address": "HzUhxgap8Jr8wSq8Q8jQBPxFAgXYSbbp3XC6uuGN3qbR",
  "metadata": {
    "name": "agentWallet",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "executeTokenTransfer",
      "discriminator": [
        56,
        178,
        89,
        210,
        83,
        156,
        33,
        36
      ],
      "accounts": [
        {
          "name": "agent",
          "signer": true,
          "relations": [
            "walletConfig"
          ]
        },
        {
          "name": "owner"
        },
        {
          "name": "walletConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "fromTokenAccount",
          "writable": true
        },
        {
          "name": "toTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "executeTransfer",
      "discriminator": [
        233,
        126,
        160,
        184,
        235,
        206,
        31,
        119
      ],
      "accounts": [
        {
          "name": "agent",
          "signer": true,
          "relations": [
            "walletConfig"
          ]
        },
        {
          "name": "owner"
        },
        {
          "name": "walletConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeWallet",
      "discriminator": [
        213,
        0,
        239,
        240,
        73,
        100,
        188,
        193
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "walletConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "initializeWalletArgs"
            }
          }
        }
      ]
    },
    {
      "name": "setAgent",
      "discriminator": [
        154,
        74,
        121,
        91,
        137,
        19,
        101,
        166
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "walletConfig"
          ]
        },
        {
          "name": "walletConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "newAgent",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "toggleFreeze",
      "discriminator": [
        136,
        3,
        54,
        90,
        252,
        134,
        158,
        172
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "walletConfig"
          ]
        },
        {
          "name": "walletConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updatePolicy",
      "discriminator": [
        212,
        245,
        246,
        7,
        163,
        151,
        18,
        57
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "walletConfig"
          ]
        },
        {
          "name": "walletConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "updatePolicyArgs"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "walletConfig",
      "discriminator": [
        248,
        6,
        16,
        222,
        235,
        5,
        195,
        69
      ]
    }
  ],
  "events": [
    {
      "name": "policyUpdated",
      "discriminator": [
        225,
        112,
        112,
        67,
        95,
        236,
        245,
        161
      ]
    },
    {
      "name": "transferExecuted",
      "discriminator": [
        8,
        128,
        224,
        132,
        112,
        216,
        192,
        35
      ]
    },
    {
      "name": "walletFreezeToggled",
      "discriminator": [
        81,
        58,
        166,
        16,
        83,
        15,
        2,
        56
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "walletFrozen",
      "msg": "Wallet is currently frozen"
    },
    {
      "code": 6001,
      "name": "unauthorizedAgent",
      "msg": "Unauthorized agent"
    },
    {
      "code": 6002,
      "name": "exceedsTransactionLimit",
      "msg": "Transaction amount exceeds limit"
    },
    {
      "code": 6003,
      "name": "recipientNotAllowed",
      "msg": "Recipient is not in the allowlist"
    },
    {
      "code": 6004,
      "name": "cooldownNotElapsed",
      "msg": "Cooldown period has not elapsed"
    },
    {
      "code": 6005,
      "name": "exceedsDailyLimit",
      "msg": "Daily spending limit exceeded"
    },
    {
      "code": 6006,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6007,
      "name": "allowlistFull",
      "msg": "Allowlist is full"
    },
    {
      "code": 6008,
      "name": "invalidLimitConfig",
      "msg": "Invalid limit configuration"
    }
  ],
  "types": [
    {
      "name": "initializeWalletArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent",
            "type": "pubkey"
          },
          {
            "name": "maxTxAmount",
            "type": "u64"
          },
          {
            "name": "dailyLimit",
            "type": "u64"
          },
          {
            "name": "windowDuration",
            "type": "i64"
          },
          {
            "name": "cooldownSeconds",
            "type": "i64"
          },
          {
            "name": "allowlist",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "policyUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "transferExecuted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agent",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "spentInWindow",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "updatePolicyArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maxTxAmount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "dailyLimit",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "windowDuration",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "cooldownSeconds",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "allowlist",
            "type": {
              "option": {
                "vec": "pubkey"
              }
            }
          }
        ]
      }
    },
    {
      "name": "walletConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "agent",
            "type": "pubkey"
          },
          {
            "name": "isFrozen",
            "type": "bool"
          },
          {
            "name": "maxTxAmount",
            "type": "u64"
          },
          {
            "name": "dailyLimit",
            "type": "u64"
          },
          {
            "name": "spentInWindow",
            "type": "u64"
          },
          {
            "name": "windowStart",
            "type": "i64"
          },
          {
            "name": "windowDuration",
            "type": "i64"
          },
          {
            "name": "cooldownSeconds",
            "type": "i64"
          },
          {
            "name": "lastTxTimestamp",
            "type": "i64"
          },
          {
            "name": "allowlist",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "walletFreezeToggled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "isFrozen",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
