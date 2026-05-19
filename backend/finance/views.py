from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from .models import Transaction, Budget, Goal, Subscription
from .serializers import TransactionSerializer, BudgetSerializer, GoalSerializer, SubscriptionSerializer
from .category_engine import categorize_transaction, should_auto_categorize

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        category = serializer.validated_data.get('category')
        category_key = serializer.validated_data.get('category_key')

        if should_auto_categorize(category, category_key):
            prediction = categorize_transaction(
                serializer.validated_data.get('merchant'),
                serializer.validated_data.get('note'),
                serializer.validated_data.get('amount'),
            )
            serializer.save(
                user=self.request.user,
                category=prediction['category'],
                category_key=prediction['category_key'],
            )
            return

        serializer.save(user=self.request.user)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        budgets = Budget.objects.filter(user=user)
        for budget in budgets:
            cat_key = budget.category_key
            filter_keys = ['dining', 'food'] if cat_key in ['dining', 'food'] else [cat_key]
            expenses_sum = Transaction.objects.filter(
                user=user,
                category_key__in=filter_keys,
                amount__lt=0
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            spent_val = abs(expenses_sum)
            if budget.spent_amount != spent_val:
                budget.spent_amount = spent_val
                budget.save()
        return Budget.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
