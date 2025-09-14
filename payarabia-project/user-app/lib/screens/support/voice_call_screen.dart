import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_appbar.dart';
import '../../services/voice_call_service.dart';

class VoiceCallScreen extends StatefulWidget {
  final Map<String, dynamic> ticket;

  const VoiceCallScreen({
    Key? key,
    required this.ticket,
  }) : super(key: key);

  @override
  State<VoiceCallScreen> createState() => _VoiceCallScreenState();
}

class _VoiceCallScreenState extends State<VoiceCallScreen> {
  bool _isCallActive = false;
  bool _isMuted = false;
  bool _isSpeakerOn = false;
  bool _isConnecting = false;
  String _callStatus = 'جاري الاتصال...';

  @override
  void initState() {
    super.initState();
    _requestPermissions();
  }

  Future<void> _requestPermissions() async {
    final microphonePermission = await Permission.microphone.request();
    if (microphonePermission != PermissionStatus.granted) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('يجب السماح بالوصول للميكروفون لإجراء المكالمة'),
            backgroundColor: Colors.red,
          ),
        );
        Navigator.pop(context);
      }
      return;
    }

    _initiateCall();
  }

  Future<void> _initiateCall() async {
    setState(() {
      _isConnecting = true;
      _callStatus = 'جاري الاتصال...';
    });

    try {
      final success = await VoiceCallService.initiateCall(widget.ticket['id']);
      
      if (success) {
        setState(() {
          _isCallActive = true;
          _isConnecting = false;
          _callStatus = 'متصل';
        });
      } else {
        setState(() {
          _isConnecting = false;
          _callStatus = 'فشل في الاتصال';
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('فشل في إجراء المكالمة. حاول مرة أخرى.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isConnecting = false;
        _callStatus = 'خطأ في الاتصال';
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('خطأ: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _endCall() async {
    await VoiceCallService.endCall();
    setState(() {
      _isCallActive = false;
      _callStatus = 'انتهت المكالمة';
    });
    
    if (mounted) {
      Navigator.pop(context);
    }
  }

  Future<void> _toggleMute() async {
    await VoiceCallService.muteMicrophone(!_isMuted);
    setState(() {
      _isMuted = !_isMuted;
    });
  }

  Future<void> _toggleSpeaker() async {
    await VoiceCallService.setSpeakerphoneOn(!_isSpeakerOn);
    setState(() {
      _isSpeakerOn = !_isSpeakerOn;
    });
  }

  @override
  void dispose() {
    if (_isCallActive) {
      VoiceCallService.endCall();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'مكالمة صوتية'),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.primary,
              AppColors.primaryDark,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Call Status
              Expanded(
                flex: 2,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Avatar
                    CircleAvatar(
                      radius: 60,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      child: const Icon(
                        Icons.support_agent,
                        size: 60,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: AppSizes.paddingLarge),
                    
                    // Support Agent Name
                    const Text(
                      'فريق الدعم الفني',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: AppSizes.paddingSmall),
                    
                    // Ticket Subject
                    Text(
                      widget.ticket['subject'],
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppSizes.paddingLarge),
                    
                    // Call Status
                    Text(
                      _callStatus,
                      style: const TextStyle(
                        fontSize: 18,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),

              // Call Controls
              Expanded(
                flex: 1,
                child: Container(
                  padding: const EdgeInsets.all(AppSizes.paddingLarge),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Control Buttons Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          // Mute Button
                          _buildControlButton(
                            icon: _isMuted ? Icons.mic_off : Icons.mic,
                            isActive: _isMuted,
                            onPressed: _isCallActive ? _toggleMute : null,
                          ),
                          
                          // Speaker Button
                          _buildControlButton(
                            icon: _isSpeakerOn ? Icons.volume_up : Icons.volume_down,
                            isActive: _isSpeakerOn,
                            onPressed: _isCallActive ? _toggleSpeaker : null,
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: AppSizes.paddingLarge),
                      
                      // End Call Button
                      Container(
                        width: 80,
                        height: 80,
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: IconButton(
                          onPressed: _endCall,
                          icon: const Icon(
                            Icons.call_end,
                            size: 40,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required bool isActive,
    required VoidCallback? onPressed,
  }) {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: isActive ? Colors.white : Colors.white.withOpacity(0.2),
        shape: BoxShape.circle,
      ),
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(
          icon,
          size: 30,
          color: isActive ? AppColors.primary : Colors.white,
        ),
      ),
    );
  }
}