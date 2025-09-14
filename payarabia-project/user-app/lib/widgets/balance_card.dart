import 'package:flutter/material.dart';
import '../utils/constants.dart';

class BalanceCard extends StatelessWidget {
  final double balance;
  final String currency;
  final VoidCallback? onTap;

  const BalanceCard({
    Key? key,
    required this.balance,
    required this.currency,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
        child: Container(
          padding: const EdgeInsets.all(AppSizes.paddingLarge),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppSizes.radiusLarge),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primary,
                AppColors.primaryDark,
              ],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'الرصيد المتاح',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                  ),
                  Icon(
                    Icons.account_balance_wallet,
                    color: Colors.white70,
                    size: AppSizes.iconMedium,
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.paddingMedium),
              Text(
                '${balance.toStringAsFixed(2)} $currency',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppSizes.paddingSmall),
              Row(
                children: [
                  const Icon(
                    Icons.visibility,
                    color: Colors.white70,
                    size: AppSizes.iconSmall,
                  ),
                  const SizedBox(width: 4),
                  const Text(
                    'إظهار الرصيد',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class UsdtBalanceCard extends StatelessWidget {
  final double balance;
  final String? address;
  final VoidCallback? onTap;

  const UsdtBalanceCard({
    Key? key,
    required this.balance,
    this.address,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppSizes.radiusMedium),
        child: Padding(
          padding: const EdgeInsets.all(AppSizes.paddingMedium),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'محفظة USDT',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.success.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppSizes.radiusSmall),
                    ),
                    child: const Text(
                      'BEP20',
                      style: TextStyle(
                        color: AppColors.success,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSizes.paddingSmall),
              Text(
                '${balance.toStringAsFixed(6)} USDT',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
              if (address != null) ...[
                const SizedBox(height: AppSizes.paddingSmall),
                Text(
                  'العنوان: ${address!.substring(0, 10)}...${address!.substring(address!.length - 10)}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}