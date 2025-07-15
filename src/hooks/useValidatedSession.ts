import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function useValidatedSession() {
	const { data: session, status } = useSession();
	const [isValidUser, setIsValidUser] = useState<boolean | null>(null);

	useEffect(() => {
		const validateUser = async () => {
			if (!session?.supabaseUid) return;

			try {
				const response = await fetch(`/api/auth/validate?userId=${session.userId}`);
				if (response.ok) {
					const data = await response.json();
					setIsValidUser(data.valid);

					if (!data.valid) {
						console.log("User invalid, signing out...");
						signOut();
					}
				} else {
					console.error("Failed to validate user");
					setIsValidUser(false);
				}
			} catch (err) {
				console.error("Validation error", err);
				setIsValidUser(false);
			}
		};

		if (session) {
			validateUser();
		} else if (status !== "loading") {
			setIsValidUser(false);
		}
	}, [session, status]);

	return {
		session,
		isValidUser,
		loading: status === "loading" || isValidUser === null,
	};
}
