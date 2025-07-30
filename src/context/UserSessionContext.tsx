import { createContext, useContext } from "react";
import type { Session } from "next-auth";
import { useValidatedSession } from "@/hooks/useValidatedSession";

interface UserSessionContextValue {
	session: Session | null;
	isValidUser: boolean | null;
	loading: boolean;
}

export const UserSessionContext = createContext<UserSessionContextValue | undefined>(undefined);

export function useUserSession(): UserSessionContextValue {
	const context = useContext(UserSessionContext);
	if (!context) {
		throw new Error("useUserSession must be used within a UserSessionProvider");
	}
	return context;
}

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
	const { session, isValidUser, loading } = useValidatedSession();
	return (
		<UserSessionContext.Provider value={{ session, isValidUser, loading }}>
			{children}
		</UserSessionContext.Provider>
	);
}
