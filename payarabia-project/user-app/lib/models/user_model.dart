class User {
  final String id;
  final String fullName;
  final String email;
  final String phone;
  final DateTime dateOfBirth;
  final DateTime createdAt;
  final bool isVerified;
  final Wallet? wallet;
  final UsdtWallet? usdtWallet;

  User({
    required this.id,
    required this.fullName,
    required this.email,
    required this.phone,
    required this.dateOfBirth,
    required this.createdAt,
    required this.isVerified,
    this.wallet,
    this.usdtWallet,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'],
      fullName: json['fullName'],
      email: json['email'],
      phone: json['phone'],
      dateOfBirth: DateTime.parse(json['dateOfBirth']),
      createdAt: DateTime.parse(json['createdAt']),
      isVerified: json['isVerified'] ?? false,
      wallet: json['wallet'] != null ? Wallet.fromJson(json['wallet']) : null,
      usdtWallet: json['usdtWallet'] != null ? UsdtWallet.fromJson(json['usdtWallet']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'fullName': fullName,
      'email': email,
      'phone': phone,
      'dateOfBirth': dateOfBirth.toIso8601String(),
    };
  }
}

class Wallet {
  final double balance;
  final String currency;

  Wallet({
    required this.balance,
    required this.currency,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      balance: (json['balance'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'SAR',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'balance': balance,
      'currency': currency,
    };
  }
}

class UsdtWallet {
  final String? address;
  final double balance;

  UsdtWallet({
    this.address,
    required this.balance,
  });

  factory UsdtWallet.fromJson(Map<String, dynamic> json) {
    return UsdtWallet(
      address: json['address'],
      balance: (json['balance'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'address': address,
      'balance': balance,
    };
  }
}