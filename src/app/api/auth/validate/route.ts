import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { User } from '@/types/db-types';

export async function GET(request: NextRequest) {
  try {
    // Get the session to verify the request is authenticated
    const session = await getServerSession(authOptions);
    
    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json({ valid: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get userId from query params
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    // Ensure userId matches the session's userId for security
    if (!userId || userId !== session.userId) {
      return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 });
    }
    
    // Check if user exists in the users table
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, supabase_uid')
      .eq('id', userId)
      .single<User>();
    
    if (error || !user) {
      console.log('User validation failed:', error || 'User not found');
      return NextResponse.json({ valid: false }, { status: 200 });
    }
    
    // Also verify the user exists in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
      user.supabase_uid
    );
    
    if (authError || !authUser.user) {
      console.log('Supabase Auth validation failed:', authError || 'Auth user not found');
      return NextResponse.json({ valid: false }, { status: 200 });
    }
    
    // User exists in both tables
    return NextResponse.json({ valid: true }, { status: 200 });
    
  } catch (error) {
    console.error('Error validating user:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
