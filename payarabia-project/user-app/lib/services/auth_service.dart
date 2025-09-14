import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService extends ChangeNotifier {
  final SharedPreferences _prefs;
  User? _user;
  bool _isAuthenticated = false;
  String? _token;

  AuthService(this._prefs) {
    _loadAuthState();
  }

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  String? get token => _token;

  void _loadAuthState() {
    _token = _prefs.getString('token');
    _isAuthenticated = _token != null;
    
    final userJson = _prefs.getString('user');
    if (userJson != null) {
      try {
        _user = User.fromJson(Map<String, dynamic>.from(
          Uri.splitQueryString(userJson)
        ));
      } catch (e) {
        _clearAuthState();
      }
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    try {
      final response = await ApiService.login(email, password);
      
      if (response['status'] == 'success') {
        _token = response['token'];
        _user = User.fromJson(response['data']['user']);
        _isAuthenticated = true;
        
        await _saveAuthState();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('Login error: $e');
      }
      return false;
    }
  }

  Future<bool> register(Map<String, dynamic> userData) async {
    try {
      final response = await ApiService.register(userData);
      
      if (response['status'] == 'success') {
        _token = response['token'];
        _user = User.fromJson(response['data']['user']);
        _isAuthenticated = true;
        
        await _saveAuthState();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('Registration error: $e');
      }
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.logout();
    } catch (e) {
      if (kDebugMode) {
        print('Logout error: $e');
      }
    } finally {
      await _clearAuthState();
      notifyListeners();
    }
  }

  Future<void> _saveAuthState() async {
    if (_token != null) {
      await _prefs.setString('token', _token!);
    }
    
    if (_user != null) {
      // Convert user to query string format for storage
      final userMap = _user!.toJson();
      final userString = userMap.entries
          .map((e) => '${e.key}=${e.value}')
          .join('&');
      await _prefs.setString('user', userString);
    }
  }

  Future<void> _clearAuthState() async {
    await _prefs.remove('token');
    await _prefs.remove('user');
    _token = null;
    _user = null;
    _isAuthenticated = false;
  }

  Future<bool> refreshUserProfile() async {
    if (!_isAuthenticated) return false;
    
    try {
      final response = await ApiService.getUserProfile();
      
      if (response['status'] == 'success') {
        _user = User.fromJson(response['data']['user']);
        await _saveAuthState();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('Profile refresh error: $e');
      }
      return false;
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> profileData) async {
    if (!_isAuthenticated) return false;
    
    try {
      final response = await ApiService.updateUserProfile(profileData);
      
      if (response['status'] == 'success') {
        _user = User.fromJson(response['data']['user']);
        await _saveAuthState();
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('Profile update error: $e');
      }
      return false;
    }
  }

  bool isTokenValid() {
    if (_token == null) return false;
    
    try {
      // Basic token validation - in production, you might want to decode JWT
      return _token!.isNotEmpty;
    } catch (e) {
      return false;
    }
  }
}