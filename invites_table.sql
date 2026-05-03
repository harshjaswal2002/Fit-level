-- Create user_invites table for tracking invitations
CREATE TABLE IF NOT EXISTS user_invites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_phone text,
  invitee_email text,
  invite_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  accepted_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own sent invites" ON user_invites
  FOR SELECT USING (auth.uid() = inviter_id);

CREATE POLICY "Users can insert their own invites" ON user_invites
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their own invites" ON user_invites
  FOR UPDATE USING (auth.uid() = inviter_id);

-- Create indexes for better performance
CREATE INDEX user_invites_inviter_id_idx ON user_invites(inviter_id);
CREATE INDEX user_invites_status_idx ON user_invites(status);
CREATE INDEX user_invites_invitee_phone_idx ON user_invites(invitee_phone);
CREATE INDEX user_invites_invitee_email_idx ON user_invites(invitee_email);
