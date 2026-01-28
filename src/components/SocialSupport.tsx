import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Users, Heart, MessageCircle, ThumbsUp, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Post {
  id: number;
  author: string;
  authorInitials: string;
  content: string;
  category: string;
  likes: number;
  replies: number;
  timestamp: string;
  isAnonymous: boolean;
}

interface SupportGroup {
  id: number;
  name: string;
  description: string;
  members: number;
  category: string;
  moderator: string;
  isJoined: boolean;
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: 'Anonymous',
    authorInitials: 'A',
    content: 'Today was tough, but I managed to do my breathing exercises. Small wins matter. 💙',
    category: 'Anxiety',
    likes: 24,
    replies: 8,
    timestamp: '2 hours ago',
    isAnonymous: true,
  },
  {
    id: 2,
    author: 'Sarah M.',
    authorInitials: 'SM',
    content: 'Just completed my first week of therapy. Feeling hopeful for the first time in months. If you\'re hesitating, take that first step!',
    category: 'Depression',
    likes: 47,
    replies: 12,
    timestamp: '5 hours ago',
    isAnonymous: false,
  },
  {
    id: 3,
    author: 'Anonymous',
    authorInitials: 'A',
    content: 'Reminder: It\'s okay to not be okay. You\'re not alone in this journey. 🌟',
    category: 'General',
    likes: 89,
    replies: 23,
    timestamp: '1 day ago',
    isAnonymous: true,
  },
];

const mockGroups: SupportGroup[] = [
  {
    id: 1,
    name: 'Anxiety Warriors',
    description: 'A safe space for those managing anxiety. Share coping strategies and support each other.',
    members: 1247,
    category: 'Anxiety',
    moderator: 'Dr. Thandi Mthembu',
    isJoined: true,
  },
  {
    id: 2,
    name: 'Depression Support Circle',
    description: 'Connect with others who understand. Moderated by licensed therapists.',
    members: 892,
    category: 'Depression',
    moderator: 'Dr. Johan van der Merwe',
    isJoined: false,
  },
  {
    id: 3,
    name: 'Young Professionals Wellness',
    description: 'Navigate work stress, burnout, and career challenges together.',
    members: 2134,
    category: 'Stress',
    moderator: 'Lerato Khumalo',
    isJoined: true,
  },
  {
    id: 4,
    name: 'PTSD Recovery',
    description: 'Trauma-informed peer support with professional guidance.',
    members: 456,
    category: 'Trauma',
    moderator: 'Dr. Thandi Mthembu',
    isJoined: false,
  },
];

export default function SocialSupport() {
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [groups, setGroups] = useState(mockGroups);

  const handlePost = () => {
    if (!newPost.trim()) return;
    
    toast.success('Post shared successfully!', {
      description: 'Your message has been shared with the community.',
    });
    setNewPost('');
  };

  const handleJoinGroup = (groupId: number) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, isJoined: !g.isJoined, members: g.isJoined ? g.members - 1 : g.members + 1 } : g
    ));
    const group = groups.find(g => g.id === groupId);
    toast.success(group?.isJoined ? 'Left group' : 'Joined group!', {
      description: group?.isJoined ? `You left ${group.name}` : `Welcome to ${group?.name}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Community Support</h2>
        <p className="text-muted-foreground">
          Connect with others on similar journeys. You're not alone.
        </p>
      </div>

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Community Feed</TabsTrigger>
          <TabsTrigger value="groups">Support Groups</TabsTrigger>
          <TabsTrigger value="buddies">Accountability Buddies</TabsTrigger>
        </TabsList>

        {/* Community Feed */}
        <TabsContent value="feed" className="space-y-4">
          {/* Create Post */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Journey</CardTitle>
              <CardDescription>
                Your story might be exactly what someone else needs to hear today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What's on your mind? Share a win, ask for support, or offer encouragement..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows={4}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm cursor-pointer">
                    Post anonymously
                  </label>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button onClick={handlePost}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          {mockPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>{post.authorInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{post.author}</p>
                        <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                      </div>
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <p className="text-sm">{post.content}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.replies} replies
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Support Groups */}
        <TabsContent value="groups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Join a Support Group</CardTitle>
              <CardDescription>
                Moderated by licensed mental health professionals
              </CardDescription>
            </CardHeader>
          </Card>

          {groups.map((group) => (
            <Card key={group.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">{group.name}</h4>
                      <Badge variant="outline">{group.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{group.members.toLocaleString()} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span>Moderated by {group.moderator}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={group.isJoined ? 'outline' : 'default'}
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    {group.isJoined ? 'Leave' : 'Join'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Accountability Buddies */}
        <TabsContent value="buddies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Find Your Accountability Buddy</CardTitle>
              <CardDescription>
                Partner with someone on a similar journey for mutual support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>TM</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Thabo M.</p>
                        <p className="text-sm text-muted-foreground">Managing anxiety</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      Looking for someone to check in with daily. I'm working on meditation consistency.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Anxiety</Badge>
                      <Badge variant="secondary">Meditation</Badge>
                    </div>
                    <Button className="w-full" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>NK</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Naledi K.</p>
                        <p className="text-sm text-muted-foreground">Depression recovery</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      Seeking a buddy for morning motivation. Let's support each other's progress!
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Depression</Badge>
                      <Badge variant="secondary">Morning Routine</Badge>
                    </div>
                    <Button className="w-full" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted">
                <CardContent className="p-6 text-center space-y-2">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h4 className="font-semibold">Studies show accountability increases success by 65%</h4>
                  <p className="text-sm text-muted-foreground">
                    Having a buddy makes you more likely to stick with your wellness goals
                  </p>
                  <Button variant="outline">
                    Create Buddy Request
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
