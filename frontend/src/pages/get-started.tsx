import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import axios from "axios";
import { useRouter } from "next/router";

import {
  Button,
  Field,
  Fieldset,
  For,
  Input,
  NativeSelect,
  Stack,
  Container,
  Center,
  Flex,
  Box,
} from "@chakra-ui/react";
import { Toaster, toaster } from "@/components/ui/toaster";

export default function GetStarted() {
  const { user } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    organization: "",
    profile_pic_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:4000/api/users", form, {
        withCredentials: true,
      });
      router.push("/profile");
    } catch (err) {
      console.error(err);
      toaster.create({
        title: "Error creating profile",
        description: (err as any).message,
        type: "error",
        duration: 5000,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" color={"black"}>
      <Box
        as="form"
        maxW="md"
        w="100%"
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
      >
        <Fieldset.Root size="lg" maxW="md">
          <Stack>
            <Fieldset.Legend>Get Started</Fieldset.Legend>
            <Fieldset.HelperText>
              Please provide your details below.
            </Fieldset.HelperText>
          </Stack>

          <Fieldset.Content>
            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input
                name="name"
                onChange={(e) => {
                  handleChange(e);
                }}
                value={form.name}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Email address</Field.Label>
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange(e)}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Organization</Field.Label>
              <Input
                name="organization"
                value={form.organization}
                onChange={(e) => handleChange(e)}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Profile Picture </Field.Label>
              <Input name="profile_pic_url" type="file" />
            </Field.Root>
          </Fieldset.Content>

          <Button
            alignSelf="flex-start"
            mt={4}
            colorScheme="blue"
            w={"100%"}
            onClick={(e) => {
              onSubmit(e);
            }}
          >
            Submit
          </Button>
        </Fieldset.Root>
      </Box>
    </Flex>
  );
}
