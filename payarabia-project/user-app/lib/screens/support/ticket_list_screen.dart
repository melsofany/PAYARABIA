import 'package:flutter/material.dart';
import '../../utils/constants.dart';
import '../../widgets/custom_appbar.dart';
import 'create_ticket_screen.dart';
import 'ticket_details_screen.dart';

class TicketListScreen extends StatefulWidget {
  const TicketListScreen({Key? key}) : super(key: key);

  @override
  State<TicketListScreen> createState() => _TicketListScreenState();
}

class _TicketListScreenState extends State<TicketListScreen> {
  List<Map<String, dynamic>> _tickets = [
    {
      'id': '1',
      'ticketNumber': 'TK-2024-001',
      'subject': 'مشكلة في تحويل الأموال',
      'status': 'open',
      'priority': 'high',
      'createdAt': '2024-01-15T10:30:00Z',
      'lastMessage': 'لم يتم تحويل المبلغ بنجاح',
    },
    {
      'id': '2',
      'ticketNumber': 'TK-2024-002',
      'subject': 'استفسار حول رسوم التحويل',
      'status': 'in_progress',
      'priority': 'medium',
      'createdAt': '2024-01-14T15:45:00Z',
      'lastMessage': 'ما هي رسوم التحويل للعملات المختلفة؟',
    },
    {
      'id': '3',
      'ticketNumber': 'TK-2024-003',
      'subject': 'تحديث بيانات الحساب',
      'status': 'resolved',
      'priority': 'low',
      'createdAt': '2024-01-13T09:20:00Z',
      'lastMessage': 'تم تحديث البيانات بنجاح',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'تذاكر الدعم'),
      body: Column(
        children: [
          // Quick Actions
          Container(
            padding: const EdgeInsets.all(AppSizes.paddingMedium),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const CreateTicketScreen(),
                        ),
                      );
                    },
                    icon: const Icon(Icons.add),
                    label: const Text('تذكرة جديدة'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: AppSizes.paddingMedium),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // Navigate to voice call
                    },
                    icon: const Icon(Icons.phone),
                    label: const Text('اتصال صوتي'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Tickets List
          Expanded(
            child: _tickets.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.support_agent,
                          size: 64,
                          color: AppColors.textSecondary,
                        ),
                        SizedBox(height: AppSizes.paddingMedium),
                        Text(
                          'لا توجد تذاكر دعم',
                          style: TextStyle(
                            fontSize: 18,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        SizedBox(height: AppSizes.paddingSmall),
                        Text(
                          'أنشئ تذكرة جديدة للحصول على المساعدة',
                          style: TextStyle(
                            color: AppColors.textHint,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(AppSizes.paddingMedium),
                    itemCount: _tickets.length,
                    itemBuilder: (context, index) {
                      final ticket = _tickets[index];
                      return _buildTicketCard(ticket);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> ticket) {
    return Card(
      margin: const EdgeInsets.only(bottom: AppSizes.paddingMedium),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TicketDetailsScreen(ticket: ticket),
            ),
          );
        },
        borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    ticket['ticketNumber'],
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  _buildStatusChip(ticket['status']),
                ],
              ),
              const SizedBox(height: AppSizes.paddingSmall),
              
              Text(
                ticket['subject'],
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSizes.paddingSmall),
              
              Text(
                ticket['lastMessage'],
                style: const TextStyle(
                  color: AppColors.textSecondary,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: AppSizes.paddingSmall),
              
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      _buildPriorityChip(ticket['priority']),
                      const SizedBox(width: AppSizes.paddingSmall),
                      const Icon(
                        Icons.access_time,
                        size: 16,
                        color: AppColors.textSecondary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        _formatDate(ticket['createdAt']),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                  const Icon(
                    Icons.arrow_forward_ios,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                ],
              ),
            ],
          ),
        ),
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