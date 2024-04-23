'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@secret-hub/ui/hooks/use-toast'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { verifySchema } from '../../../schemas/verifySchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '../../../../types/ApiResponse'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@secret-hub/ui/components/form'
import { Input } from '@secret-hub/ui/components/input'
import { Button } from '@secret-hub/ui/components/button'

const VerifyAccount = () => {
  const router = useRouter()
  const params = useParams<{ username: string }>()
  const { toast } = useToast()
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      })

      if (response.data?.success) {
        toast({
          title: 'Account verified',
        })

        router.replace('/dashboard')
      } else {
        toast({
          title: 'Error verifying account',
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast({
        title: 'Error verifying account',
        description: axiosError.response?.data?.message ?? 'An error occurred',
      })
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight lg:text-3xl">
          Verify Your Account
        </h1>
        <p className="mb-4">
          Please enter the verification code sent to your email address
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant={'default'}>
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default VerifyAccount
