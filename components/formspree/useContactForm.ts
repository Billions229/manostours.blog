import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useParams } from 'next/navigation'
import { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useTranslation } from 'app/[locale]/i18n/client'

export const useContactForm = () => {
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'common')
  const [state, setState] = useState({ submitting: false, succeeded: false, errors: {} })
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState({ submitting: true, succeeded: false, errors: {} })

    // Simulate form submission
    setTimeout(() => {
      setState({ submitting: false, succeeded: true, errors: {} })
    }, 1000)
  }

  const reset = useCallback(() => {
    setState({ submitting: false, succeeded: false, errors: {} })
  }, [])

  useEffect(() => {
    if (state.succeeded && !state.submitting) {
      toast.success(t('thanks'), {
        position: 'bottom-right',
      })
      setTimeout(() => {
        setName('')
        setEmail('')
        setMessage('')
        reset()
      }, 2000)
    }

    if (state.errors && Object.keys(state.errors).length > 0) {
      toast.error(t('error'))
    }
  }, [state, reset, t])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value)
  }

  return {
    state,
    handleSubmit,
    name,
    email,
    message,
    handleNameChange,
    handleEmailChange,
    handleMessageChange,
    t,
    reset,
  }
}
