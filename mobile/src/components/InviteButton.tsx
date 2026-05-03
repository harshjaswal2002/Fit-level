import React, { useState } from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { InviteModal } from './InviteModal'

interface InviteButtonProps {
  userId: string
  userName: string
  style?: any
}

export const InviteButton: React.FC<InviteButtonProps> = ({
  userId,
  userName,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false)

  const openInviteModal = () => {
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.inviteButton, style]}
        onPress={openInviteModal}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonIcon}>👥</Text>
          <Text style={styles.buttonText}>Invite Friends</Text>
        </View>
      </TouchableOpacity>

      <InviteModal
        visible={modalVisible}
        onClose={closeModal}
        userId={userId}
        userName={userName}
      />
    </>
  )
}

const styles = StyleSheet.create({
  inviteButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
