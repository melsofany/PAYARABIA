import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_appbar.dart';
import 'voice_call_screen.dart';

class TicketDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> ticket;

  const TicketDetailsScreen({
    Key? key,
    required this.ticket,
  }) : super(key: key);

  @override
  State<TicketDetailsScreen> createState() => _TicketDetailsScreenState();
}

class _TicketDetailsScreenState extends State<TicketDetailsScreen> {
  final _messageController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      'id': '1',
      'message': 'لم يتم تحويل المبلغ بنجاح رغم أن العملية تمت',
      'senderType': 'user',
      'senderName': 'أحمد محمد',
      'createdAt': '2024-01-15T10:30:00Z',
    },
    {
      'id': '2',
      'message': 'مرحباً أحمد، نحن نتحقق من المشكلة وسنرد عليك قريباً',
      'senderType': 'admin',
      'senderName': 'فريق الدعم',
      'createdAt': '2024-01-15T11:15:00Z',
    },
    {
      'id': '3',
      'message': 'تم حل المشكلة، المبلغ سيعود إلى حسابك خلال 24 ساعة',
      'senderType': 'admin',
      'senderName': 'فريق الدعم',
      'createdAt': '2024-01-15T14:30:00Z',
    },
  ];

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    setState(() {
      _messages.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'message': _messageController.text.trim(),
        'senderType': 'user',
        'senderName': 'أحمد محمد',
        'createdAt': DateTime.now().toIso8601String(),
      });
    });

    _messageController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: widget.ticket['ticketNumber'],
        actions: [
          IconButton(
            icon: const Icon(Icons.phone),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => VoiceCallScreen(ticket: widget.ticket),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Ticket Info Header
          Container(
            padding: const EdgeInsets.all(AppSizes.paddingMedium),
            color: AppColors.background,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.ticket['subject'],
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    _buildStatusChip(widget.ticket['status']),
                  ],
                ),
                const SizedBox(height: AppSizes.paddingSmall),
                
                Row(
                  children: [
                    _buildPriorityChip(widget.ticket['priority']),
                    const SizedBox(width: AppSizes.paddingSmall),
                    const Icon(
                      Icons.access_time,
                      size: 16,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _formatDate(widget.ticket['createdAt']),
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Messages List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(AppSizes.paddingMedium),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _buildMessageBubble(message);
              },
            ),
          ),

          // Message Input
          Container(
            padding: const EdgeInsets.all(AppSizes.paddingMedium),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: AppColors.divider),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'اكتب رسالتك...',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: AppSizes.paddingSmall),
                IconButton(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> message) {
    final isUser = message['senderType'] == 'user';
    
    return Container(
      margin: const EdgeInsets.only(bottom: AppSizes.paddingMedium),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primary,
              child: const Icon(
                Icons.support_agent,
                size: 16,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: AppSizes.paddingSmall),
          ],
          
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(AppSizes.paddingMedium),
              decoration: BoxDecoration(
                color: isUser ? AppColors.primary : AppColors.background,
                borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!isUser)
                    Text(
                      message['senderName'],
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  if (!isUser) const SizedBox(height: 4),
                  
                  Text(
                    message['message'],
                    style: TextStyle(
                      color: isUser ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  
                  Text(
                    _formatDate(message['createdAt']),
                    style: TextStyle(
                      fontSize: 10,
                      color: isUser ? Colors.white70 : AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          if (isUser) ...[
            const SizedBox(width: AppSizes.paddingSmall),
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primary,
              child: const Icon(
                Icons.person,
                size: 16,
                color: Colors.white,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String text;
    
    switch (status) {
      case 'open':
        color = AppColors.error;
        text = 'مفتوحة';
        break;
      case 'in_progress':
        color = AppColors.warning;
        text = 'قيد المعالجة';
        break;
      case 'resolved':
        color = AppColors.success;
        text = 'تم الحل';
        break;
      default:
        color = AppColors.textSecondary;
        text = 'غير محدد';
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSizes.radiusSmall),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildPriorityChip(String priority) {
    Color color;
    String text;
    
    switch (priority) {
      case 'urgent':
        color = AppColors.error;
        text = 'عاجل';
        break;
      case 'high':
        color = AppColors.warning;
        text = 'عالي';
        break;
      case 'medium':
        color = AppColors.info;
        text = 'متوسط';
        break;
      case 'low':
        color = AppColors.success;
        text = 'منخفض';
        break;
      default:
        color = AppColors.textSecondary;
        text = 'غير محدد';
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSizes.radiusSmall),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 0) {
      return 'منذ ${difference.inDays} يوم';
    } else if (difference.inHours > 0) {
      return 'منذ ${difference.inHours} ساعة';
    } else if (difference.inMinutes > 0) {
      return 'منذ ${difference.inMinutes} دقيقة';
    } else {
      return 'الآن';
    }
  }
}