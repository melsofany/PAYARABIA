import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://api.payarabia.com';

  static Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
      'Accept-Language': 'ar',
    };
  }

  static Future<dynamic> get(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.get(Uri.parse('$baseUrl/$endpoint'), headers: headers);
    
    if (response.statusCode == 200) {
      return json.decode(utf8.decode(response.bodyBytes));
    } else {
      throw Exception('Failed to load data: ${response.statusCode}');
    }
  }

  static Future<dynamic> post(String endpoint, dynamic data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
      body: json.encode(data),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return json.decode(utf8.decode(response.bodyBytes));
    } else {
      throw Exception('Failed to post data: ${response.statusCode}');
    }
  }

  static Future<dynamic> put(String endpoint, dynamic data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
      body: json.encode(data),
    );
    
    if (response.statusCode == 200) {
      return json.decode(utf8.decode(response.bodyBytes));
    } else {
      throw Exception('Failed to update data: ${response.statusCode}');
    }
  }

  static Future<dynamic> delete(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
    );
    
    if (response.statusCode == 200 || response.statusCode == 204) {
      return response.statusCode == 200 
          ? json.decode(utf8.decode(response.bodyBytes)) 
          : null;
    } else {
      throw Exception('Failed to delete data: ${response.statusCode}');
    }
  }

  // Authentication methods
  static Future<dynamic> login(String email, String password) async {
    return post('auth/login', {'email': email, 'password': password});
  }

  static Future<dynamic> register(Map<String, dynamic> userData) async {
    return post('auth/register', userData);
  }

  static Future<dynamic> logout() async {
    return post('auth/logout', {});
  }

  // Wallet methods
  static Future<dynamic> getWalletBalance() async {
    return get('wallet/balance');
  }

  static Future<dynamic> getTransactions({int page = 1, int limit = 20}) async {
    return get('wallet/transactions?page=$page&limit=$limit');
  }

  static Future<dynamic> transferMoney(Map<String, dynamic> transferData) async {
    return post('wallet/transfer', transferData);
  }

  static Future<dynamic> getExchangeRates() async {
    return get('wallet/exchange-rates');
  }

  static Future<dynamic> exchangeCurrency(Map<String, dynamic> exchangeData) async {
    return post('wallet/exchange', exchangeData);
  }

  // USDT methods
  static Future<dynamic> getUsdtBalance() async {
    return get('usdt/balance');
  }

  static Future<dynamic> generateUsdtAddress() async {
    return post('usdt/generate-address', {});
  }

  static Future<dynamic> withdrawUsdt(Map<String, dynamic> withdrawalData) async {
    return post('usdt/withdraw', withdrawalData);
  }

  // Support methods
  static Future<dynamic> createSupportTicket(Map<String, dynamic> ticketData) async {
    return post('support/tickets', ticketData);
  }

  static Future<dynamic> getSupportTickets({int page = 1, int limit = 20}) async {
    return get('support/tickets?page=$page&limit=$limit');
  }

  static Future<dynamic> getTicketDetails(String ticketId) async {
    return get('support/tickets/$ticketId');
  }

  static Future<dynamic> addTicketMessage(String ticketId, String message) async {
    return post('support/tickets/$ticketId/messages', {'message': message});
  }

  // Voice call methods
  static Future<dynamic> initiateVoiceCall(String ticketId) async {
    return post('support/voice-call/initiate', {'ticketId': ticketId});
  }

  static Future<dynamic> endVoiceCall(String callId) async {
    return post('support/voice-call/$callId/end', {});
  }

  // User profile methods
  static Future<dynamic> getUserProfile() async {
    return get('user/profile');
  }

  static Future<dynamic> updateUserProfile(Map<String, dynamic> profileData) async {
    return put('user/profile', profileData);
  }

  static Future<dynamic> uploadProfileImage(String imagePath) async {
    // Implementation for file upload
    return post('user/upload-image', {'imagePath': imagePath});
  }
}