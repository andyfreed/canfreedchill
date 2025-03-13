/*
  # Remove Chat System

  1. Changes
    - Drop chat_messages table and related functions
    - Remove chat-related policies
*/

-- Drop the chat_messages table and related objects
DROP TABLE IF EXISTS public.chat_messages;

-- Drop the set_user_email function
DROP FUNCTION IF EXISTS public.set_user_email(text);