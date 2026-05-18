from django.contrib import admin
from .models import Transaction, Budget, Goal, Subscription

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'merchant', 'amount', 'category', 'date')
    list_filter = ('category', 'date', 'user')
    search_fields = ('merchant', 'note', 'user__email')

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'budget_amount', 'spent_amount', 'remaining_amount', 'status')
    list_filter = ('status', 'category_key', 'user')
    search_fields = ('name', 'user__email')

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'current_amount', 'target_amount', 'deadline', 'priority')
    list_filter = ('priority', 'category', 'user')
    search_fields = ('name', 'user__email')

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'amount', 'status', 'value_score')
    list_filter = ('status', 'usage_level', 'user')
    search_fields = ('name', 'user__email')
