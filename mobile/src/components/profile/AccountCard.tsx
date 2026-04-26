import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const AccountCard: React.FC = () => {
  const { session, logout } = useAuth()
  const [loading, setLoading] = useState('')

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password reset link will be sent to your email.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: async () => {
            if (!session?.user?.email) return
            
            try {
              setLoading('password')
              const { error } = await supabase.auth.resetPasswordForEmail(
                session.user.email,
                {
                  redirectTo: 'fitlevel://reset-password'
                }
              )
              
              if (error) throw error
              
              Alert.alert(
                'Reset Link Sent',
                'Check your email for password reset instructions.',
                [{ text: 'OK' }]
              )
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to send reset link')
            } finally {
              setLoading('')
            }
          }
        }
      ]
    )
  }

  const handleLinkedAccounts = () => {
    const email = session?.user?.email
    const provider = session?.user?.app_metadata?.provider
    
    Alert.alert(
      'Linked Accounts',
      `Email: ${email || 'Not available'}\nProvider: ${provider || 'Email'}`,
      [{ text: 'OK' }]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will permanently delete your account and all associated data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setLoading('delete')
                      // In a real implementation, you would call a Supabase function
                      // to properly delete the user account
                      const { error } = await supabase.rpc('delete_user_account')
                      
                      if (error) {
                        throw error
                      }
                      
                      // Sign out after successful deletion
                      await logout()
                      
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been permanently deleted.',
                        [{ text: 'OK' }]
                      )
                    } catch (error: any) {
                      Alert.alert(
                        'Error',
                        error.message || 'Failed to delete account. Please contact support.'
                      )
                    } finally {
                      setLoading('')
                    }
                  }
                }
              ]
            )
          }
        }
      ]
    )
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              setLoading('signout')
              await logout()
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out')
              setLoading('')
            }
          }
        }
      ]
    )
  }

  const AccountAction = ({ 
    title, 
    description, 
    onPress, 
    type = 'normal',
    isLoading = false 
  }: {
    title: string
    description: string
    onPress: () => void
    type?: 'normal' | 'warning' | 'danger'
    isLoading?: boolean
  }) => {
    const getButtonStyle = () => {
      switch (type) {
        case 'warning':
          return styles.actionButtonWarning
        case 'danger':
          return styles.actionButtonDanger
        default:
          return styles.actionButton
      }
    }

    const getTextStyle = () => {
      switch (type) {
        case 'warning':
          return styles.actionTextWarning
        case 'danger':
          return styles.actionTextDanger
        default:
          return styles.actionText
      }
    }

    return (
      <TouchableOpacity
        style={[styles.accountAction, getButtonStyle()]}
        onPress={onPress}
        disabled={isLoading}
      >
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
        <Text style={[styles.actionArrow, getTextStyle()]}>
          {isLoading ? '...' : '→'}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.accountSection}>
        <Text style={styles.sectionTitle}>Account Management</Text>
        
        <AccountAction
          title="Change Password"
          description="Reset your password via email"
          onPress={handleChangePassword}
          isLoading={loading === 'password'}
        />

        <AccountAction
          title="Linked Accounts"
          description="View connected authentication methods"
          onPress={handleLinkedAccounts}
        />

        <AccountAction
          title="Delete Account"
          description="Permanently delete your account and data"
          onPress={handleDeleteAccount}
          type="danger"
          isLoading={loading === 'delete'}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.sessionSection}>
        <Text style={styles.sectionTitle}>Session</Text>
        
        <AccountAction
          title="Sign Out"
          description="Sign out of your current session"
          onPress={handleSignOut}
          type="warning"
          isLoading={loading === 'signout'}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ Account Information</Text>
        <Text style={styles.infoText}>• Email: {session?.user?.email || 'Not available'}</Text>
        <Text style={styles.infoText}>• User ID: {session?.user?.id?.slice(0, 8) || 'Unknown'}...</Text>
        <Text style={styles.infoText}>• Provider: {session?.user?.app_metadata?.provider || 'Email'}</Text>
        <Text style={styles.infoText}>• Last sign in: {session?.user?.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleDateString() : 'Unknown'}</Text>
      </View>

      <View style={styles.supportSection}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        <Text style={styles.supportText}>If you have any issues with your account, please contact our support team.</Text>
        <TouchableOpacity style={styles.supportButton}>
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  accountSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 12,
  },
  accountAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  actionButton: {
    borderColor: '#333',
  },
  actionButtonWarning: {
    borderColor: '#ffa500',
    backgroundColor: '#1a1500',
  },
  actionButtonDanger: {
    borderColor: '#ff6b6b',
    backgroundColor: '#1a0f0f',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#888',
  },
  actionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionText: {
    color: '#00ff88',
  },
  actionTextWarning: {
    color: '#ffa500',
  },
  actionTextDanger: {
    color: '#ff6b6b',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  sessionSection: {
    marginBottom: 16,
  },
  infoSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00ff88',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  supportSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 8,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  supportButtonText: {
    color: '#00ff88',
    fontWeight: '600',
  },
})

export default AccountCard
