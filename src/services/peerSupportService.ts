import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PeerProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_color: string;
  bio?: string;
  conditions: string[];
  is_active: boolean;
  reputation_score: number;
  joined_at: string;
  last_active: string;
}

export interface SupportGroup {
  id: string;
  name: string;
  description?: string;
  category: string;
  group_type: string;
  max_members: number;
  is_moderated: boolean;
  moderator_ids: string[];
  guidelines?: string;
  created_at: string;
  is_active: boolean;
  last_activity: string;
  member_count?: number;
}

export interface ChatMessage {
  id: string;
  group_id?: string;
  buddy_pair_id?: string;
  sender_profile_id: string;
  content: string;
  message_type: 'text' | 'voice' | 'system';
  is_flagged: boolean;
  flagged_reason?: string;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  sender?: PeerProfile;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  peer_profile_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
  last_read_at: string;
  is_muted: boolean;
}

class PeerSupportService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private messageCallbacks: Map<string, (message: ChatMessage) => void> = new Map();
  private presenceCallbacks: Map<string, (presence: any) => void> = new Map();

  // ============================================================================
  // PEER PROFILE MANAGEMENT
  // ============================================================================

  async createPeerProfile(data: {
    display_name: string;
    avatar_color: string;
    bio?: string;
    conditions: string[];
  }): Promise<PeerProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile, error } = await supabase
      .from('peer_support_profiles')
      .insert({
        user_id: user.id,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return profile;
  }

  async getPeerProfile(userId?: string): Promise<PeerProfile | null> {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!targetUserId) return null;

    const { data, error } = await supabase
      .from('peer_support_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updatePeerProfile(updates: Partial<PeerProfile>): Promise<PeerProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('peer_support_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLastActive(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('peer_support_profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('user_id', user.id);
  }

  // ============================================================================
  // SUPPORT GROUP MANAGEMENT
  // ============================================================================

  async listSupportGroups(filters?: {
    category?: string;
    search?: string;
  }): Promise<SupportGroup[]> {
    let query = supabase
      .from('peer_support_groups')
      .select('*')
      .eq('is_active', true)
      .order('last_activity', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Get member counts
    const groupsWithCounts = await Promise.all(
      data.map(async (group) => {
        const count = await this.getGroupMemberCount(group.id);
        return { ...group, member_count: count };
      })
    );

    return groupsWithCounts;
  }

  async getGroupMemberCount(groupId: string): Promise<number> {
    const { count, error } = await supabase
      .from('peer_group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (error) throw error;
    return count || 0;
  }

  async getSupportGroup(groupId: string): Promise<SupportGroup | null> {
    const { data, error } = await supabase
      .from('peer_support_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      const member_count = await this.getGroupMemberCount(groupId);
      return { ...data, member_count };
    }
    
    return null;
  }

  async getMyGroups(): Promise<SupportGroup[]> {
    const profile = await this.getPeerProfile();
    if (!profile) return [];

    const { data: memberships, error } = await supabase
      .from('peer_group_memberships')
      .select('group_id')
      .eq('peer_profile_id', profile.id);

    if (error) throw error;

    const groupIds = memberships.map(m => m.group_id);
    if (groupIds.length === 0) return [];

    const { data: groups, error: groupsError } = await supabase
      .from('peer_support_groups')
      .select('*')
      .in('id', groupIds)
      .eq('is_active', true);

    if (groupsError) throw groupsError;

    const groupsWithCounts = await Promise.all(
      groups.map(async (group) => {
        const count = await this.getGroupMemberCount(group.id);
        return { ...group, member_count: count };
      })
    );

    return groupsWithCounts;
  }

  // ============================================================================
  // GROUP MEMBERSHIP
  // ============================================================================

  async joinGroup(groupId: string): Promise<GroupMembership> {
    const profile = await this.getPeerProfile();
    if (!profile) throw new Error('Peer profile not found');

    const { data, error } = await supabase
      .from('peer_group_memberships')
      .insert({
        group_id: groupId,
        peer_profile_id: profile.id,
        role: 'member',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async leaveGroup(groupId: string): Promise<void> {
    const profile = await this.getPeerProfile();
    if (!profile) throw new Error('Peer profile not found');

    const { error } = await supabase
      .from('peer_group_memberships')
      .delete()
      .eq('group_id', groupId)
      .eq('peer_profile_id', profile.id);

    if (error) throw error;
  }

  async getGroupMembers(groupId: string): Promise<PeerProfile[]> {
    const { data, error } = await supabase
      .from('peer_group_memberships')
      .select('peer_profile_id, peer_support_profiles(*)')
      .eq('group_id', groupId);

    if (error) throw error;
    return data.map((m: any) => m.peer_support_profiles);
  }

  async isGroupMember(groupId: string): Promise<boolean> {
    const profile = await this.getPeerProfile();
    if (!profile) return false;

    const { data, error } = await supabase
      .from('peer_group_memberships')
      .select('id')
      .eq('group_id', groupId)
      .eq('peer_profile_id', profile.id)
      .single();

    return !error && !!data;
  }

  // ============================================================================
  // CHAT MESSAGES
  // ============================================================================

  async sendMessage(params: {
    groupId?: string;
    buddyPairId?: string;
    content: string;
    messageType?: 'text' | 'voice' | 'system';
  }): Promise<ChatMessage> {
    const profile = await this.getPeerProfile();
    if (!profile) throw new Error('Peer profile not found');

    const { data, error } = await supabase
      .from('peer_chat_messages')
      .insert({
        group_id: params.groupId,
        buddy_pair_id: params.buddyPairId,
        sender_profile_id: profile.id,
        content: params.content,
        message_type: params.messageType || 'text',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMessages(params: {
    groupId?: string;
    buddyPairId?: string;
    limit?: number;
    before?: string;
  }): Promise<ChatMessage[]> {
    let query = supabase
      .from('peer_chat_messages')
      .select(`
        *,
        sender:peer_support_profiles!sender_profile_id(*)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(params.limit || 50);

    if (params.groupId) {
      query = query.eq('group_id', params.groupId);
    }

    if (params.buddyPairId) {
      query = query.eq('buddy_pair_id', params.buddyPairId);
    }

    if (params.before) {
      query = query.lt('created_at', params.before);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.reverse();
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('peer_chat_messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (error) throw error;
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  subscribeToGroup(
    groupId: string,
    onMessage: (message: ChatMessage) => void,
    onPresence?: (presence: any) => void
  ): () => void {
    const channelName = `group:${groupId}`;
    
    // Unsubscribe if already subscribed
    this.unsubscribeFromChannel(channelName);

    const channel = supabase.channel(channelName);

    // Subscribe to new messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'peer_chat_messages',
        filter: `group_id=eq.${groupId}`,
      },
      async (payload) => {
        // Fetch full message with sender info
        const { data } = await supabase
          .from('peer_chat_messages')
          .select(`
            *,
            sender:peer_support_profiles!sender_profile_id(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onMessage(data);
        }
      }
    );

    // Subscribe to presence if callback provided
    if (onPresence) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        onPresence(state);
      });

      // Track presence
      this.getPeerProfile().then((profile) => {
        if (profile) {
          channel.track({
            profile_id: profile.id,
            display_name: profile.display_name,
            avatar_color: profile.avatar_color,
            online_at: new Date().toISOString(),
          });
        }
      });
    }

    channel.subscribe();
    this.channels.set(channelName, channel);
    this.messageCallbacks.set(channelName, onMessage);
    if (onPresence) {
      this.presenceCallbacks.set(channelName, onPresence);
    }

    // Return unsubscribe function
    return () => this.unsubscribeFromChannel(channelName);
  }

  subscribeToBuddyChat(
    buddyPairId: string,
    onMessage: (message: ChatMessage) => void
  ): () => void {
    const channelName = `buddy:${buddyPairId}`;
    
    this.unsubscribeFromChannel(channelName);

    const channel = supabase.channel(channelName);

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'peer_chat_messages',
        filter: `buddy_pair_id=eq.${buddyPairId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from('peer_chat_messages')
          .select(`
            *,
            sender:peer_support_profiles!sender_profile_id(*)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          onMessage(data);
        }
      }
    );

    channel.subscribe();
    this.channels.set(channelName, channel);
    this.messageCallbacks.set(channelName, onMessage);

    return () => this.unsubscribeFromChannel(channelName);
  }

  private unsubscribeFromChannel(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
      this.messageCallbacks.delete(channelName);
      this.presenceCallbacks.delete(channelName);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel) => channel.unsubscribe());
    this.channels.clear();
    this.messageCallbacks.clear();
    this.presenceCallbacks.clear();
  }

  // ============================================================================
  // TYPING INDICATORS
  // ============================================================================

  async sendTypingIndicator(groupId: string): Promise<void> {
    const channelName = `group:${groupId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      const profile = await this.getPeerProfile();
      if (profile) {
        channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            profile_id: profile.id,
            display_name: profile.display_name,
          },
        });
      }
    }
  }
}

export const peerSupportService = new PeerSupportService();
