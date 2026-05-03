import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native'
import { inviteService, Contact, InviteData } from '../services/inviteService'

interface InviteModalProps {
  visible: boolean
  onClose: () => void
  userId: string
  userName: string
}

export const InviteModal: React.FC<InviteModalProps> = ({
  visible,
  onClose,
  userId,
  userName,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingTo, setSendingTo] = useState<string[]>([])
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [useSMS, setUseSMS] = useState(true)

  useEffect(() => {
    if (visible) {
      loadContacts()
    }
  }, [visible])

  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredContacts(filtered)
    } else {
      setFilteredContacts(contacts)
    }
  }, [searchQuery, contacts])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const loadedContacts = await inviteService.getContacts()
      setContacts(loadedContacts)
      setFilteredContacts(loadedContacts)
    } catch (error) {
      console.error('Error loading contacts:', error)
      Alert.alert('Error', 'Failed to load contacts. Please check permissions.')
    } finally {
      setLoading(false)
    }
  }

  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.some(c => c.id === contact.id)
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id)
      } else {
        return [...prev, contact]
      }
    })
  }

  const sendInvites = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Selection', 'Please select at least one contact to invite.')
      return
    }

    try {
      setSendingTo(selectedContacts.map(c => c.id))
      
      const results = await Promise.allSettled(
        selectedContacts.map(contact =>
          inviteService.sendAndTrackInvite(userId, userName, contact, useSMS ? 'sms' : 'email')
        )
      )

      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
      const failed = results.length - successful

      if (successful > 0) {
        Alert.alert(
          'Invitations Sent!',
          `${successful} invitation${successful > 1 ? 's' : ''} sent successfully${failed > 0 ? `\n${failed} failed` : ''}`
        )
      } else {
        Alert.alert('Failed', 'No invitations could be sent. Please try again.')
      }

      setSelectedContacts([])
      onClose()
    } catch (error) {
      console.error('Error sending invites:', error)
      Alert.alert('Error', 'Failed to send invitations. Please try again.')
    } finally {
      setSendingTo([])
    }
  }

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.some(c => c.id === item.id)
    const isSending = sendingTo.includes(item.id)
    const hasValidContact = useSMS ? item.phoneNumbers.length > 0 : item.emails.length > 0

    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          isSelected && styles.selectedContact,
          !hasValidContact && styles.disabledContact,
        ]}
        onPress={() => hasValidContact && toggleContactSelection(item)}
        disabled={!hasValidContact || isSending}
      >
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactDetail}>
            {useSMS 
              ? (item.phoneNumbers[0] || 'No phone number')
              : (item.emails[0] || 'No email')
            }
          </Text>
        </View>
        {hasValidContact && (
          <View style={isSelected ? styles.selectedCheckbox : styles.checkbox} />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Invite Friends</Text>
          <TouchableOpacity onPress={sendInvites} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>
              Send ({selectedContacts.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Send via:</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleOption}>SMS</Text>
            <Switch
              value={useSMS}
              onValueChange={setUseSMS}
              trackColor={{ true: '#007AFF', false: '#E5E5EA' }}
            />
            <Text style={styles.toggleOption}>Email</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            style={styles.contactsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleOption: {
    fontSize: 16,
    color: '#1D1D1F',
    marginHorizontal: 15,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#8E8E93',
  },
  contactsList: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  selectedContact: {
    backgroundColor: '#E3F2FD',
  },
  disabledContact: {
    opacity: 0.5,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  contactDetail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  selectedCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
})
