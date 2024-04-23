'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import * as z from 'zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from '@secret-hub/ui/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { signUpSchema } from '../../schemas/signUpSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '../../../types/ApiResponse'
import { Button } from '@secret-hub/ui/components/button'
import { Input } from '@secret-hub/ui/components/input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@secret-hub/ui/components/form'
import { useForm } from 'react-hook-form'

export default function SignInPage() {
  const [username, setUsername] = useState('')
  const [usernameMsg, setUsernameMsg] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const debounced = useDebounceCallback(setUsername, 300)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true)
        setUsernameMsg('')
        try {
          const res = await axios.get(
            `/api/check-username?username=${username}`
          )

          setIsCheckingUsername(false)
          setUsernameMsg(res.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMsg(
            axiosError.response?.data.message ??
              'An error occurred while checking username'
          )
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique()
  }, [username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      const res = await axios.post<ApiResponse>('/api/sign-up', data)
      if (res.data.success) {
        toast({
          title: 'Account created',
          description: 'Please verify your email to login',
        })
        router.replace(`/verify/${username}`)
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: 'Sign up failed',
        description: axiosError.response?.data.message ?? 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Join Secret Msg
          </h1>
          <p className="mb-4">
            Sign up to send messages to your friends and family
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value)
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && '...'}
                  <p className="text-sm text-red-500">
                    {usernameMsg === ''
                      ? ''
                      : usernameMsg === 'Username is available'
                        ? '✅'
                        : 'Username is not available'}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant={'default'} disabled={isSubmitting}>
              {isSubmitting ? 'Please Wait' : 'Sign up'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
