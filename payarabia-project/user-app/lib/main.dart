import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'services/auth_service.dart';
import 'screens/main_screen.dart';
import 'screens/auth/login_screen.dart';
import 'utils/constants.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize shared preferences
  final prefs = await SharedPreferences.getInstance();
  
  runApp(MyApp(prefs: prefs));
}

class MyApp extends StatelessWidget {
  final SharedPreferences prefs;
  
  const MyApp({Key? key, required this.prefs}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthService(prefs)),
      ],
      child: MaterialApp(
        title: 'PAYARABIA',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          fontFamily: 'Tajawal',
          textTheme: const TextTheme(
            headline1: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            headline2: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            bodyText1: TextStyle(fontSize: 16),
            bodyText2: TextStyle(fontSize: 14),
          ),
        ),
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('ar', 'SA'),
          Locale('en', 'US'),
        ],
        locale: const Locale('ar', 'SA'),
        home: Consumer<AuthService>(
          builder: (context, authService, child) {
            return authService.isAuthenticated 
                ? const MainScreen() 
                : const LoginScreen();
          },
        ),
      ),
    );
  }
}