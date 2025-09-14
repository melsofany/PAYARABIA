import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:flutter/foundation.dart';
import 'api_service.dart';

class VoiceCallService {
  static RtcEngine? _engine;
  static bool _isInitialized = false;
  static bool _isInCall = false;
  static String? _currentChannel;
  static String? _currentToken;

  static Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      _engine = createAgoraRtcEngine();
      await _engine!.initialize(const RtcEngineContext(
        appId: 'YOUR_AGORA_APP_ID', // Replace with your Agora App ID
      ));

      // Enable audio
      await _engine!.enableAudio();
      
      // Set up event handlers
      _engine!.registerEventHandler(
        RtcEngineEventHandler(
          onJoinChannelSuccess: (RtcConnection connection, int elapsed) {
            if (kDebugMode) {
              print('Successfully joined channel: ${connection.channelId}');
            }
            _isInCall = true;
          },
          onUserJoined: (RtcConnection connection, int remoteUid, int elapsed) {
            if (kDebugMode) {
              print('Remote user joined: $remoteUid');
            }
          },
          onUserOffline: (RtcConnection connection, int remoteUid, UserOfflineReasonType reason) {
            if (kDebugMode) {
              print('Remote user left: $remoteUid, reason: $reason');
            }
          },
          onLeaveChannel: (RtcConnection connection, RtcStats stats) {
            if (kDebugMode) {
              print('Left channel');
            }
            _isInCall = false;
          },
          onError: (ErrorCodeType err, String msg) {
            if (kDebugMode) {
              print('Agora error: $err - $msg');
            }
          },
        ),
      );

      _isInitialized = true;
    } catch (e) {
      if (kDebugMode) {
        print('Failed to initialize Agora: $e');
      }
      rethrow;
    }
  }

  static Future<bool> initiateCall(String ticketId) async {
    try {
      if (!_isInitialized) {
        await initialize();
      }

      // Get call details from server
      final response = await ApiService.initiateVoiceCall(ticketId);
      
      if (response['status'] == 'success') {
        final callData = response['data'];
        _currentChannel = callData['channelName'];
        _currentToken = callData['token'];

        // Join the channel
        await _engine!.joinChannel(
          token: _currentToken!,
          channelId: _currentChannel!,
          uid: 0, // Let Agora assign a UID
          options: const ChannelMediaOptions(
            clientRoleType: ClientRoleType.clientRoleBroadcaster,
            channelProfile: ChannelProfileType.channelProfileCommunication,
          ),
        );

        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) {
        print('Failed to initiate call: $e');
      }
      return false;
    }
  }

  static Future<void> endCall() async {
    try {
      if (_isInCall && _currentChannel != null) {
        await _engine!.leaveChannel();
        _isInCall = false;
        _currentChannel = null;
        _currentToken = null;
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to end call: $e');
      }
    }
  }

  static Future<void> muteMicrophone(bool mute) async {
    try {
      await _engine!.muteLocalAudioStream(mute);
    } catch (e) {
      if (kDebugMode) {
        print('Failed to mute/unmute microphone: $e');
      }
    }
  }

  static Future<void> setSpeakerphoneOn(bool on) async {
    try {
      await _engine!.setEnableSpeakerphone(on);
    } catch (e) {
      if (kDebugMode) {
        print('Failed to set speakerphone: $e');
      }
    }
  }

  static bool get isInCall => _isInCall;
  static String? get currentChannel => _currentChannel;

  static Future<void> dispose() async {
    try {
      if (_isInCall) {
        await endCall();
      }
      await _engine?.release();
      _isInitialized = false;
    } catch (e) {
      if (kDebugMode) {
        print('Failed to dispose Agora engine: $e');
      }
    }
  }
}