import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native'
import { ProfileData } from '../../services/profileService'
import { calculateProfileCompletion, getCompletionColor, getCompletionMessage } from '../../utils/profileCompletion'

interface CompletionCardProps {
  percentage: number
  profileData: ProfileData | null
}

const CompletionCard: React.FC<CompletionCardProps> = ({ percentage, profileData }) => {
  const [expanded, setExpanded] = React.useState(false)
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  const completion = calculateProfileCompletion({
    profile: profileData?.profile || null,
    metrics: profileData?.metrics || null,
    preferences: profileData?.preferences || null,
    integrations: profileData?.integrations || []
  })

  const completionColor = getCompletionColor(percentage)
  const completionMessage = getCompletionMessage(percentage)

  const scrollToSection = (section: string) => {
    // This would scroll to the specific section
    // Implementation depends on the parent component
    console.log('Scroll to section:', section)
  }

  const CompletionItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.completionItem,
        item.completed && styles.completedItem
      ]}
      onPress={() => item.section && scrollToSection(item.section)}
      disabled={item.completed}
    >
      <View style={styles.itemLeft}>
        <View style={[
          styles.checkCircle,
          item.completed && styles.completedCircle
        ]}>
          {item.completed && (
            <Text style={styles.checkMark}>✓</Text>
          )}
        </View>
        <Text style={[
          styles.itemText,
          item.completed && styles.completedText
        ]}>
          {item.label}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={[
          styles.itemWeight,
          item.completed && styles.completedWeight
        ]}>
          {item.weight}%
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Completion</Text>
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.expandButton}>
            {expanded ? '−' : '+'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${percentage}%`,
                backgroundColor: completionColor
              }
            ]} 
          />
        </View>
        <Text style={[styles.percentageText, { color: completionColor }]}>
          {percentage}% Complete
        </Text>
      </View>

      <Text style={styles.message}>{completionMessage}</Text>

      {expanded && (
        <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
          {completion.items.map((item, index) => (
            <CompletionItem key={item.id} item={item} />
          ))}
        </ScrollView>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completion.completedItems}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completion.totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completion.totalItems - completion.completedItems}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>
    </Animated.View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00ff88',
    width: 30,
    height: 30,
    textAlign: 'center',
    lineHeight: 30,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  itemsContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  completionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    marginBottom: 8,
  },
  completedItem: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#00ff88',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: '#00ff88',
  },
  checkMark: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  itemText: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
  },
  completedText: {
    color: '#00ff88',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemWeight: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  completedWeight: {
    color: '#00ff88',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
})

export default CompletionCard
