import React, { useState } from 'react'
import {
  View, Text, StyleSheet, Pressable, TextInput, Modal, Animated,
} from 'react-native'
import { X, Star, Send } from 'lucide-react-native'
import { fontFamily } from '@/constants/theme'

const C = {
  bg: '#FCFBF9',
  card: '#FFFFFF',
  border: '#EDE6DD',
  foreground: '#33384A',
  muted: '#857565',
  primary: '#F8682B',
  star: '#F59E0B',
}

interface ReviewModalProps {
  visible: boolean
  venueName: string
  onClose: () => void
}

export function ReviewModal({ visible, venueName, onClose }: ReviewModalProps) {
  const [stars, setStars] = useState<number>(0)
  const [text, setText] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  function handleSubmit() {
    setSubmitted(true)
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setSubmitted(false)
      setStars(0)
      setText('')
      onClose()
    })
  }

  function handleClose() {
    setStars(0)
    setText('')
    setSubmitted(false)
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={s.backdrop} onPress={handleClose} />
      <View style={s.sheet}>
        <View style={s.handleBar} />
        <View style={s.header}>
          <View>
            <Text style={s.pretitle}>LEAVE A REVIEW</Text>
            <Text style={s.title} numberOfLines={1}>{venueName}</Text>
          </View>
          <Pressable style={s.closeBtn} onPress={handleClose} testID="review-modal-close">
            <X size={16} color={C.foreground} />
          </Pressable>
        </View>

        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Pressable key={i} onPress={() => setStars(i)} testID={`star-${i}`}>
              <Star
                size={36}
                color={C.star}
                fill={i <= stars ? C.star : 'transparent'}
                strokeWidth={1.5}
              />
            </Pressable>
          ))}
        </View>
        <Text style={s.starsHint}>
          {stars === 0 ? 'Tap to rate' : stars <= 2 ? 'Could be better' : stars <= 4 ? 'Good experience' : 'Amazing!'}
        </Text>

        <TextInput
          style={s.input}
          placeholder="Share your experience..."
          placeholderTextColor={C.muted}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={280}
          testID="review-text-input"
        />
        <Text style={s.charCount}>{text.length}/280</Text>

        <Pressable
          style={[s.submitBtn, stars === 0 && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={stars === 0}
          testID="review-submit"
        >
          <Send size={16} color="#FFFFFF" strokeWidth={2} />
          <Text style={s.submitText}>Submit review</Text>
        </Pressable>

        {submitted ? (
          <Animated.View style={[s.toast, { opacity: fadeAnim }]} pointerEvents="none">
            <Text style={s.toastText}>Review submitted! Thanks</Text>
          </Animated.View>
        ) : null}
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center',
    marginTop: 10, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  pretitle: {
    fontSize: 10, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 1,
    fontFamily: fontFamily.accent,
  },
  title: {
    fontSize: 18, fontWeight: '700', color: C.foreground,
    letterSpacing: -0.3, fontFamily: fontFamily.display,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  starsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    paddingVertical: 12,
  },
  starsHint: {
    fontSize: 13, color: C.muted, textAlign: 'center',
    marginBottom: 16, fontFamily: fontFamily.body,
  },
  input: {
    marginHorizontal: 16,
    backgroundColor: C.bg, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 14, fontSize: 14, color: C.foreground,
    minHeight: 100, fontFamily: fontFamily.body,
    lineHeight: 20,
  },
  charCount: {
    fontSize: 11, color: C.muted, textAlign: 'right',
    marginHorizontal: 16, marginTop: 6, marginBottom: 16,
    fontFamily: fontFamily.body,
  },
  submitBtn: {
    marginHorizontal: 16, height: 52, borderRadius: 14,
    backgroundColor: C.primary,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  submitText: {
    fontSize: 15, fontWeight: '700', color: '#FFFFFF',
    fontFamily: fontFamily.bodySemiBold,
  },
  toast: {
    position: 'absolute', bottom: 100, alignSelf: 'center',
    backgroundColor: '#33384A',
    paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 9999,
  },
  toastText: {
    color: '#FFFFFF', fontSize: 14, fontFamily: fontFamily.bodySemiBold,
  },
})
