'use client';
import { useAuth } from "@/contexts/AuthContext";
import { unsubscribeEmail } from "@/services/account.service";
import { App, Button } from "antd";
import { useState } from "react";

export default function UnsubscribeEmail() {
  const { loggedInAccount } = useAuth();
  const { notification } = App.useApp();
  const [disable, setDisable] = useState(false);

  const unsubscribe = async () => {
    try {
      await unsubscribeEmail();
      notification.success({
        message: 'Saved Changes',
        description: "You're now unsubscribed from our subscription list.",
      });
      setDisable(true);
    } catch {
      notification.error({
        message: 'Changes not saved',
        description: 'Something went wrong.',
      });
    }
  }

  return (
    <>
      {loggedInAccount ? (
        <>
          <h1>Hi {loggedInAccount.passenger?.firstName}, are you sure you want to unsubscribe from our subscription list?</h1>
          <Button type='primary' onClick={unsubscribe} disabled={disable}>Yes!</Button>
        </>
      ) : (
          <h1>You need to login to unsubscribe</h1>
      )}
    </>
  )
}