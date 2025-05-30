import { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import axios from "axios";
import { useRouter } from "next/router";

export function useEnsureUser() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    (async () => {
      try {
        const resp = await axios.post(
          "http://localhost:4000/api/users/check",
          { email: user.email },
          { withCredentials: true }
        );
        if (resp.data.exists) {
          router.replace("/profile");
        } else {
          router.replace("/get-started");
        }
      } catch (err) {
        console.error("Error checking user:", err);
      }
    })();
  }, [user, isLoading]);
}
