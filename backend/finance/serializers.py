from rest_framework import serializers
from .models import Transaction, Budget, Goal, Subscription

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('user',)
        extra_kwargs = {
            'category': {'required': False, 'allow_blank': True},
            'category_key': {'required': False, 'allow_blank': True},
        }

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ('user', 'remaining_amount', 'status')

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ('user',)

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ('user',)
