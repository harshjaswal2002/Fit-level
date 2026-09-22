import * as Contacts from 'expo-contacts/legacy'
import * as SMS from 'expo-sms'
import { Linking } from 'react-native'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

export interface Contact {
  id: string
  name: string
  phoneNumbers: string[]
  emails: string[]
}

export interface InviteData {
  id?: string
  inviter_id: string
  invitee_phone?: string
  invitee_email?: string
  invite_url: string
  status: 'pending' | 'sent' | 'accepted' | 'declined'
  created_at?: string
  sent_at: string | null
  accepted_at?: string
}

export class InviteService {
  private static readonly INVITE_URL = 'https://fit-level.app/invite'

  // Request contacts permission
  static async requestContactsPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.requestPermissionsAsync()
      return status === 'granted'
    } catch (error) {
      console.error('Error requesting contacts permission:', error)
      return false
    }
  }

  // Get all contacts from device
  static async getContacts(): Promise<Contact[]> {
    try {
      const hasPermission = await this.requestContactsPermission()
      if (!hasPermission) {
        throw new Error('Contacts permission denied')
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails
        ],
        pageSize: 1000,
        pageOffset: 0,
      })

      return data
        .map(contact => ({
          id: contact.id || '',
          name: contact.name || '',
          phoneNumbers:
            contact.phoneNumbers
              ?.map(phone => phone.number || '')
              .filter(Boolean) || [],
          emails:
            contact.emails
              ?.map(email => email.email || '')
              .filter(Boolean) || [],
        }))
        .filter(
          contact =>
            contact.name &&
            (contact.phoneNumbers.length > 0 ||
              contact.emails.length > 0)
        )
    } catch (error) {
      console.error('Error fetching contacts:', error)
      return []
    }
  }

  // Send SMS invitation
  static async sendSMSInvite(
    phoneNumber: string,
    inviterName: string
  ): Promise<boolean> {
    try {
      const isAvailable = await SMS.isAvailableAsync()
      if (!isAvailable) {
        throw new Error('SMS not available on this device')
      }

      const message = `Hey! I'm using Fit-Level to track my fitness journey. Join me! 🏋️‍♂️\n\n${this.INVITE_URL}\n\n- ${inviterName}`

      const { result } = await SMS.sendSMSAsync([phoneNumber], message)
      return result === 'sent'
    } catch (error) {
      console.error('Error sending SMS:', error)
      return false
    }
  }

  // Send email invitation
  static async sendEmailInvite(
    email: string,
    inviterName: string
  ): Promise<boolean> {
    try {
      const subject = 'Join me on Fit-Level!'
      const body = `Hey!\n\nI'm using Fit-Level to track my fitness journey and thought you'd love it too! 🏋️‍♂️\n\nJoin me here: ${this.INVITE_URL}\n\n- ${inviterName}\n\nLet's get fit together! 💪`

      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`

      const supported = await Linking.canOpenURL(mailtoUrl)
      if (!supported) {
        throw new Error('No email client available')
      }

      await Linking.openURL(mailtoUrl)
      return true
    } catch (error) {
      console.error('Error sending email invite:', error)
      return false
    }
  }

  // Track invitation in database
  static async trackInvite(
    inviterId: string,
    inviteePhone?: string,
    inviteeEmail?: string
  ): Promise<InviteData> {
    try {
      const { data, error } = await supabase
        .from('user_invites')
        // @ts-ignore
        .insert<Database['public']['Tables']['user_invites']['Insert']>({
          inviter_id: inviterId,
          invitee_phone: inviteePhone,
          invitee_email: inviteeEmail,
          invite_url: this.INVITE_URL,
          status: 'pending',
          sent_at: null,
        })
        .select()
        .single()

      if (error) throw error

      return data as InviteData
    } catch (error) {
      console.error('Error tracking invite:', error)
      throw error
    }
  }

  // Update invite status
  static async updateInviteStatus(
    inviteId: string,
    status: InviteData['status']
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_invites')
        //@ts-ignore
        .update({
          status,
          sent_at:
            status === 'sent'
              ? new Date().toISOString()
              : null,
        })
        .eq('id', inviteId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating invite status:', error)
      throw error
    }
  }

  // Get user's sent invites
  static async getUserInvites(
    userId: string
  ): Promise<InviteData[]> {
    try {
      const { data, error } = await supabase
        .from('user_invites')
        .select('*')
        .eq('inviter_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data as InviteData[]) || []
    } catch (error) {
      console.error('Error fetching user invites:', error)
      return []
    }
  }

  // Send invite and track it
  static async sendAndTrackInvite(
    inviterId: string,
    inviterName: string,
    contact: Contact,
    method: 'sms' | 'email'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const phoneNumber =
        method === 'sms' ? contact.phoneNumbers[0] : undefined
      const email =
        method === 'email' ? contact.emails[0] : undefined

      if (!phoneNumber && !email) {
        return {
          success: false,
          error: 'No contact information available',
        }
      }

      // Step 1: Track invite
      const trackedInvite = await this.trackInvite(
        inviterId,
        phoneNumber,
        email
      )

      // Step 2: Send invite
      let sendSuccess = false

      if (method === 'sms' && phoneNumber) {
        sendSuccess = await this.sendSMSInvite(
          phoneNumber,
          inviterName
        )
      } else if (method === 'email' && email) {
        sendSuccess = await this.sendEmailInvite(
          email,
          inviterName
        )
      }

      // Step 3: Update status
      if (trackedInvite.id) {
        await this.updateInviteStatus(
          trackedInvite.id,
          sendSuccess ? 'sent' : 'pending'
        )
      }

      return {
        success: sendSuccess,
        error: sendSuccess
          ? undefined
          : 'Failed to send invitation',
      }
    } catch (error) {
      console.error('Error in sendAndTrackInvite:', error)

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred',
      }
    }
  }
}

export const inviteService = InviteService