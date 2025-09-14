import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/auth_service.dart';
import '../../utils/constants.dart';
import '../../widgets/balance_card.dart';
import 'transfer_screen.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({Key? key}) : super(key: key);

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  double _sarBalance = 1250.50;
  double _usdtBalance = 150.25;
  String? _usdtAddress = '0x1234567890abcdef1234567890abcdef12345678';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'المحفظة'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSizes.paddingMedium),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // SAR Balance Card
            BalanceCard(
              balance: _sarBalance,
              currency: 'SAR',
              onTap: () {
                // Show balance details
              },
            ),
            const SizedBox(height: AppSizes.paddingMedium),

            // USDT Balance Card
            UsdtBalanceCard(
              balance: _usdtBalance,
              address: _usdtAddress,
              onTap: () {
                // Show USDT details
              },
            ),
            const SizedBox(height: AppSizes.paddingLarge),

            // Quick Actions
            const Text(
              'العمليات السريعة',
              style: AppTextStyles.headline3,
            ),
            const SizedBox(height: AppSizes.paddingMedium),

            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: AppSizes.paddingMedium,
              mainAxisSpacing: AppSizes.paddingMedium,
              childAspectRatio: 1.2,
              children: [
                _buildActionCard(
                  context,
                  'تحويل الأموال',
                  Icons.send,
                  AppColors.primary,
                  () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const TransferScreen(),
                      ),
                    );
                  },
                ),
                _buildActionCard(
                  context,
                  'شحن المحفظة',
                  Icons.add_circle,
                  AppColors.success,
                  () {
                    _showTopUpDialog();
                  },
                ),
                _buildActionCard(
                  context,
                  'سحب الأموال',
                  Icons.account_balance,
                  AppColors.warning,
                  () {
                    _showWithdrawDialog();
                  },
                ),
                _buildActionCard(
                  context,
                  'تحويل عملة',
                  Icons.swap_horiz,
                  AppColors.info,
                  () {
                    _showExchangeDialog();
                  },
                ),
              ],
            ),
            const SizedBox(height: AppSizes.paddingLarge),

            // Recent Transactions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'المعاملات الأخيرة',
                  style: AppTextStyles.headline3,
                ),
                TextButton(
                  onPressed: () {
                    // Navigate to transactions list
                  },
                  child: const Text('عرض الكل'),
                ),
              ],
            ),
            const SizedBox(height: AppSizes.paddingMedium),

            Card(
              child: Column(
                children: [
                  _buildTransactionItem(
                    'تحويل إلى أحمد محمد',
                    '2024-01-15 14:30',
                    '-500.00 SAR',
                    Colors.red,
                    Icons.send,
                  ),
                  const Divider(),
                  _buildTransactionItem(
                    'شحن المحفظة',
                    '2024-01-14 10:15',
                    '+1000.00 SAR',
                    Colors.green,
                    Icons.add_circle,
                  ),
                  const Divider(),
                  _buildTransactionItem(
                    'تحويل USDT',
                    '2024-01-13 16:45',
                    '100.00 USDT',
                    Colors.blue,
                    Icons.swap_horiz,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.paddingMedium),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: AppSizes.iconXLarge,
                color: color,
              ),
              const SizedBox(height: AppSizes.paddingSmall),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTransactionItem(
    String title,
    String date,
    String amount,
    Color amountColor,
    IconData icon,
  ) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: amountColor.withOpacity(0.1),
        child: Icon(
          icon,
          color: amountColor,
        ),
      ),
      title: Text(title),
      subtitle: Text(date),
      trailing: Text(
        amount,
        style: TextStyle(
          color: amountColor,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  void _showTopUpDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('شحن المحفظة'),
        content: const Text('اختر طريقة الشحن المناسبة لك'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to bank transfer
            },
            child: const Text('تحويل بنكي'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to card payment
            },
            child: const Text('بطاقة ائتمان'),
          ),
        ],
      ),
    );
  }

  void _showWithdrawDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('سحب الأموال'),
        content: const Text('اختر طريقة السحب المناسبة لك'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to bank transfer
            },
            child: const Text('تحويل بنكي'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to USDT withdrawal
            },
            child: const Text('سحب USDT'),
          ),
        ],
      ),
    );
  }

  void _showExchangeDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تحويل العملة'),
        content: const Text('اختر العملات المراد تحويلها'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to SAR to USDT exchange
            },
            child: const Text('SAR إلى USDT'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to USDT to SAR exchange
            },
            child: const Text('USDT إلى SAR'),
          ),
        ],
      ),
    );
  }
}