from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

# Create your models here.


User = get_user_model()


class FriendList(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='friends_list')
    friends = models.ManyToManyField(User, related_name='friend_of', blank=True)

    def __str__(self):
        return f"{self.user.username}'s Friends List"

    def add_friend(self, account):
        """ Add a new friend """
        if account not in self.friends.all():
            self.friends.add(account)
            self.save()

    def remove_friend(self, account):
        """ Remove a friend """
        if account in self.friends.all():
            self.friends.remove(account)
            self.save()

    def unfriend(self, removee):
        """ Unfriend someone (mutual removal from both FriendLists) """
        self.remove_friend(removee)
        removee_friends_list = FriendList.objects.get(user=removee)
        removee_friends_list.remove_friend(self.user)

    def is_mutual_friend(self, friend):
        """ Check if both users are friends """
        return friend in self.friends.all()

    def following_count(self):
        """ Get the count of following (mutual friends + active sent friend requests) """
        mutual_friends_count = self.friends.count() if self.friends.exists() else 0
        active_sent_requests_count = FriendRequest.get_following_count(self.user)
        return mutual_friends_count + active_sent_requests_count

    def followers_count(self):
        """ Get the count of followers (mutual friends + active received friend requests) """
        mutual_friends_count = self.friends.count() if self.friends.exists() else 0
        active_received_requests_count = FriendRequest.get_followers_count(self.user)
        return mutual_friends_count + active_received_requests_count




class FriendRequest(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    is_active = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Friend request from {self.sender.username} to {self.receiver.username}"
    
    def accept(self):
        """ Accept the friend request """
        receiver_friend_list, created = FriendList.objects.get_or_create(user=self.receiver)
        sender_friend_list, created = FriendList.objects.get_or_create(user=self.sender)

        if receiver_friend_list and sender_friend_list:
            # Add each other as friends
            receiver_friend_list.add_friend(self.sender)
            sender_friend_list.add_friend(self.receiver)
            
            # Update request status
            self.is_active = False
            self.accepted_at = timezone.now()  
            self.save()

    def decline(self):
        """ Decline the friend request """
        self.is_active = False
        self.save()

    def cancel(self):
        """ Cancel the friend request """
        self.is_active = False
        self.save()

    def re_follow(self):
        """Set request to active if unfollowed and re-followed"""
        if not self.is_active:
            self.is_active = True
            self.timestamp = timezone.now()
            self.save()

    @staticmethod
    def get_following_count(user):
        """ Calculate following count for a given user based on sent requests """
        count = FriendRequest.objects.filter(sender=user, is_active=True).count()
        print(count,'following_count from 2nd')

        return count

    @staticmethod
    def get_followers_count(user):
        """ Calculate followers count for a given user based on received requests """
        count = FriendRequest.objects.filter(receiver=user, is_active=True).count()
        print(count,'followers_count from 2nd')
        return count



    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['sender', 'receiver'], name='unique_friend_request')
        ]

