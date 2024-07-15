export const ChainlinkAbi = [
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_maximumGasPrice",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_reasonableGasPrice",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_microLinkPerEth",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_linkGweiPerObservation",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_linkGweiPerTransmission",
        type: "uint32",
      },
      {
        internalType: "contract LinkTokenInterface",
        name: "_link",
        type: "address",
      },
      {
        internalType: "int192",
        name: "_minAnswer",
        type: "int192",
      },
      {
        internalType: "int192",
        name: "_maxAnswer",
        type: "int192",
      },
      {
        internalType: "contract AccessControllerInterface",
        name: "_billingAccessController",
        type: "address",
      },
      {
        internalType: "contract AccessControllerInterface",
        name: "_requesterAccessController",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "_decimals",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "AddedAccess",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "int256",
        name: "current",
        type: "int256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
    ],
    name: "AnswerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract AccessControllerInterface",
        name: "old",
        type: "address",
      },
      {
        indexed: false,
        internalType: "contract AccessControllerInterface",
        name: "current",
        type: "address",
      },
    ],
    name: "BillingAccessControllerSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint32",
        name: "maximumGasPrice",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "reasonableGasPrice",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "microLinkPerEth",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "linkGweiPerObservation",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "linkGweiPerTransmission",
        type: "uint32",
      },
    ],
    name: "BillingSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "CheckAccessDisabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "CheckAccessEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint32",
        name: "previousConfigBlockNumber",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "configCount",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "signers",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "transmitters",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "threshold",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "encodedConfigVersion",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "encoded",
        type: "bytes",
      },
    ],
    name: "ConfigSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract LinkTokenInterface",
        name: "_oldLinkToken",
        type: "address",
      },
      {
        indexed: true,
        internalType: "contract LinkTokenInterface",
        name: "_newLinkToken",
        type: "address",
      },
    ],
    name: "LinkTokenSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "startedBy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
    ],
    name: "NewRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint32",
        name: "aggregatorRoundId",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "int192",
        name: "answer",
        type: "int192",
      },
      {
        indexed: false,
        internalType: "address",
        name: "transmitter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "int192[]",
        name: "observations",
        type: "int192[]",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "observers",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "rawReportContext",
        type: "bytes32",
      },
    ],
    name: "NewTransmission",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "transmitter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payee",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "contract LinkTokenInterface",
        name: "linkToken",
        type: "address",
      },
    ],
    name: "OraclePaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "transmitter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "current",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "proposed",
        type: "address",
      },
    ],
    name: "PayeeshipTransferRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "transmitter",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "previous",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "current",
        type: "address",
      },
    ],
    name: "PayeeshipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "RemovedAccess",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract AccessControllerInterface",
        name: "old",
        type: "address",
      },
      {
        indexed: false,
        internalType: "contract AccessControllerInterface",
        name: "current",
        type: "address",
      },
    ],
    name: "RequesterAccessControllerSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "requester",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes16",
        name: "configDigest",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "epoch",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "round",
        type: "uint8",
      },
    ],
    name: "RoundRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract AggregatorValidatorInterface",
        name: "previousValidator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "previousGasLimit",
        type: "uint32",
      },
      {
        indexed: true,
        internalType: "contract AggregatorValidatorInterface",
        name: "currentValidator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "currentGasLimit",
        type: "uint32",
      },
    ],
    name: "ValidatorConfigSet",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_transmitter",
        type: "address",
      },
    ],
    name: "acceptPayeeship",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "addAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "billingAccessController",
    outputs: [
      {
        internalType: "contract AccessControllerInterface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "checkEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "disableAccessCheck",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "enableAccessCheck",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
    ],
    name: "getAnswer",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBilling",
    outputs: [
      {
        internalType: "uint32",
        name: "maximumGasPrice",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "reasonableGasPrice",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "microLinkPerEth",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "linkGweiPerObservation",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "linkGweiPerTransmission",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLinkToken",
    outputs: [
      {
        internalType: "contract LinkTokenInterface",
        name: "linkToken",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint80",
        name: "_roundId",
        type: "uint80",
      },
    ],
    name: "getRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_roundId",
        type: "uint256",
      },
    ],
    name: "getTimestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes",
      },
    ],
    name: "hasAccess",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestAnswer",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestConfigDetails",
    outputs: [
      {
        internalType: "uint32",
        name: "configCount",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "blockNumber",
        type: "uint32",
      },
      {
        internalType: "bytes16",
        name: "configDigest",
        type: "bytes16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRound",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestTimestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestTransmissionDetails",
    outputs: [
      {
        internalType: "bytes16",
        name: "configDigest",
        type: "bytes16",
      },
      {
        internalType: "uint32",
        name: "epoch",
        type: "uint32",
      },
      {
        internalType: "uint8",
        name: "round",
        type: "uint8",
      },
      {
        internalType: "int192",
        name: "latestAnswer",
        type: "int192",
      },
      {
        internalType: "uint64",
        name: "latestTimestamp",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "linkAvailableForPayment",
    outputs: [
      {
        internalType: "int256",
        name: "availableBalance",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxAnswer",
    outputs: [
      {
        internalType: "int192",
        name: "",
        type: "int192",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minAnswer",
    outputs: [
      {
        internalType: "int192",
        name: "",
        type: "int192",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_signerOrTransmitter",
        type: "address",
      },
    ],
    name: "oracleObservationCount",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_transmitter",
        type: "address",
      },
    ],
    name: "owedPayment",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address payable",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "removeAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "requestNewRound",
    outputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "requesterAccessController",
    outputs: [
      {
        internalType: "contract AccessControllerInterface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "_maximumGasPrice",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_reasonableGasPrice",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_microLinkPerEth",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_linkGweiPerObservation",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "_linkGweiPerTransmission",
        type: "uint32",
      },
    ],
    name: "setBilling",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract AccessControllerInterface",
        name: "_billingAccessController",
        type: "address",
      },
    ],
    name: "setBillingAccessController",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_signers",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "_transmitters",
        type: "address[]",
      },
      {
        internalType: "uint8",
        name: "_threshold",
        type: "uint8",
      },
      {
        internalType: "uint64",
        name: "_encodedConfigVersion",
        type: "uint64",
      },
      {
        internalType: "bytes",
        name: "_encoded",
        type: "bytes",
      },
    ],
    name: "setConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract LinkTokenInterface",
        name: "_linkToken",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
    ],
    name: "setLinkToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_transmitters",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "_payees",
        type: "address[]",
      },
    ],
    name: "setPayees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract AccessControllerInterface",
        name: "_requesterAccessController",
        type: "address",
      },
    ],
    name: "setRequesterAccessController",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract AggregatorValidatorInterface",
        name: "_newValidator",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "_newGasLimit",
        type: "uint32",
      },
    ],
    name: "setValidatorConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_transmitter",
        type: "address",
      },
      {
        internalType: "address",
        name: "_proposed",
        type: "address",
      },
    ],
    name: "transferPayeeship",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_report",
        type: "bytes",
      },
      {
        internalType: "bytes32[]",
        name: "_rs",
        type: "bytes32[]",
      },
      {
        internalType: "bytes32[]",
        name: "_ss",
        type: "bytes32[]",
      },
      {
        internalType: "bytes32",
        name: "_rawVs",
        type: "bytes32",
      },
    ],
    name: "transmit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "transmitters",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "typeAndVersion",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "validatorConfig",
    outputs: [
      {
        internalType: "contract AggregatorValidatorInterface",
        name: "validator",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "gasLimit",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_transmitter",
        type: "address",
      },
    ],
    name: "withdrawPayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
