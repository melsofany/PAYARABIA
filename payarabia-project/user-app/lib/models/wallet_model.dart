class Transaction {
  final String id;
  final String type; // 'deposit', 'withdrawal', 'transfer', 'exchange'
  final double amount;
  final String currency;
  final String status; // 'pending', 'completed', 'failed'
  final String? description;
  final String? recipientId;
  final String? recipientName;
  final DateTime createdAt;
  final DateTime? completedAt;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.currency,
    required this.status,
    this.description,
    this.recipientId,
    this.recipientName,
    required this.createdAt,
    this.completedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['_id'] ?? json['id'],
      type: json['type'],
      amount: (json['amount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'SAR',
      status: json['status'],
      description: json['description'],
      recipientId: json['recipientId'],
      recipientName: json['recipientName'],
      createdAt: DateTime.parse(json['createdAt']),
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'amount': amount,
      'currency': currency,
      'status': status,
      'description': description,
      'recipientId': recipientId,
      'recipientName': recipientName,
    };
  }
}

class ExchangeRate {
  final String fromCurrency;
  final String toCurrency;
  final double rate;
  final DateTime lastUpdated;

  ExchangeRate({
    required this.fromCurrency,
    required this.toCurrency,
    required this.rate,
    required this.lastUpdated,
  });

  factory ExchangeRate.fromJson(Map<String, dynamic> json) {
    return ExchangeRate(
      fromCurrency: json['fromCurrency'],
      toCurrency: json['toCurrency'],
      rate: (json['rate'] ?? 0).toDouble(),
      lastUpdated: DateTime.parse(json['lastUpdated']),
    );
  }
}

class TransferRequest {
  final String recipientId;
  final String recipientName;
  final double amount;
  final String currency;
  final String? description;

  TransferRequest({
    required this.recipientId,
    required this.recipientName,
    required this.amount,
    required this.currency,
    this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'recipientId': recipientId,
      'recipientName': recipientName,
      'amount': amount,
      'currency': currency,
      'description': description,
    };
  }
}