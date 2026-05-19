from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    date = models.DateField()
    merchant = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    category_key = models.CharField(max_length=50)
    time = models.TimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=100, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time', '-created_at']

    def __str__(self):
        return f"{self.merchant} - {self.amount}"

class Budget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    name = models.CharField(max_length=100)
    category_key = models.CharField(max_length=50)
    budget_amount = models.DecimalField(max_digits=12, decimal_places=2)
    spent_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=50, default='good') # good, warning, danger
    warning_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        self.remaining_amount = self.budget_amount - self.spent_amount
        percentage = (self.spent_amount / self.budget_amount) * 100 if self.budget_amount > 0 else 0
        
        if percentage >= 90:
            self.status = 'danger'
        elif percentage >= 70:
            self.status = 'warning'
        else:
            self.status = 'good'
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} Budget - {self.user.email}"

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=255)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    deadline = models.DateField(null=True, blank=True)
    monthly_target = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    priority = models.CharField(max_length=50, default='medium') # low, medium, high
    category = models.CharField(max_length=100, null=True, blank=True)
    auto_save = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.user.email}"

class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    renewal_date = models.DateField(null=True, blank=True)
    usage_level = models.CharField(max_length=50, default='Medium')
    value_score = models.IntegerField(default=3) # 1 to 5
    status = models.CharField(max_length=50, default='active') # active, unused
    last_used_date = models.DateField(null=True, blank=True)
    warning = models.TextField(null=True, blank=True)
    potential_saving = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.user.email}"

from decimal import Decimal
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from users.models import FinancialProfile

@receiver(pre_save, sender=Transaction)
def store_original_amount(sender, instance, **kwargs):
    if instance.pk:
        try:
            original = Transaction.objects.get(pk=instance.pk)
            instance._original_amount = Decimal(str(original.amount))
        except Transaction.DoesNotExist:
            instance._original_amount = Decimal('0.00')
    else:
        instance._original_amount = Decimal('0.00')

@receiver(post_save, sender=Transaction)
def update_profile_balances(sender, instance, created, **kwargs):
    try:
        profile, _ = FinancialProfile.objects.get_or_create(user=instance.user)
        instance_amount = Decimal(str(instance.amount))
        
        if created:
            profile.cash_available += instance_amount
            profile.net_worth += instance_amount
        else:
            original_amount = Decimal(str(getattr(instance, '_original_amount', Decimal('0.00'))))
            diff = instance_amount - original_amount
            profile.cash_available += diff
            profile.net_worth += diff
        profile.save()
    except Exception as e:
        print("Error in update_profile_balances signal:", e)

@receiver(post_delete, sender=Transaction)
def update_profile_balances_on_delete(sender, instance, **kwargs):
    try:
        profile, _ = FinancialProfile.objects.get_or_create(user=instance.user)
        instance_amount = Decimal(str(instance.amount))
        profile.cash_available -= instance_amount
        profile.net_worth -= instance_amount
        profile.save()
    except Exception as e:
        print("Error in update_profile_balances_on_delete signal:", e)

@receiver(post_save, sender=Transaction)
@receiver(post_delete, sender=Transaction)
def update_budget_spent(sender, instance, **kwargs):
    try:
        cat_key = instance.category_key
        if cat_key == 'dining' or cat_key == 'food':
            budgets = Budget.objects.filter(user=instance.user, category_key__in=['dining', 'food'])
        else:
            budgets = Budget.objects.filter(user=instance.user, category_key=cat_key)
            
        for budget in budgets:
            filter_keys = ['dining', 'food'] if cat_key in ['dining', 'food'] else [cat_key]
            expenses_sum = Transaction.objects.filter(
                user=instance.user,
                category_key__in=filter_keys,
                amount__lt=0
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            budget.spent_amount = abs(expenses_sum)
            budget.save()
    except Exception as e:
        print("Error in update_budget_spent signal:", e)
