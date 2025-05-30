// frontend/src/pages/create-campaign.tsx
import { useState, ChangeEvent } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import axios from "axios";
import { useRouter } from "next/router";

import {
  Flex,
  Box,
  Stack,
  Button,
  Input,
  Fieldset,
  Field,
  Textarea,
} from "@chakra-ui/react";
import Navbar from "@/components/Navbar";

export default function CreateCampaign() {
  const { user } = useUser();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    budget: "",
    productName: "",
    description: "",
    mediaUrl: "",
    targetAudience: "",
    productPrice: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:4000/api/campaigns",
        {
          name: form.name,
          budget: Number(form.budget),
          product_name: form.productName,
          description: form.description,
          media_url: form.mediaUrl || null,
          target_audience: form.targetAudience,
          product_price: Number(form.productPrice),
        },
        { withCredentials: true }
      );
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <Flex minH="100vh" align="center" justify="center" color="black">
        <Box
          as="form"
          onSubmit={onSubmit}
          maxW="md"
          w="100%"
          bg="white"
          p={6}
          borderRadius="md"
          boxShadow="lg"
        >
          <Fieldset.Root size="lg" style={{ width: "100%" }}>
            <Stack mb={4}>
              <Fieldset.Legend>Create Campaign</Fieldset.Legend>
              <Fieldset.HelperText>
                Give your campaign a name and budget below.
              </Fieldset.HelperText>
            </Stack>

            <Fieldset.Content
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Field.Root>
                <Field.Label>Campaign Name</Field.Label>
                <Input
                  name="name"
                  placeholder="e.g. Summer Sale 2025"
                  value={form.name}
                  onChange={handleChange}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Budget (USD)</Field.Label>
                <Input
                  name="budget"
                  type="number"
                  placeholder="e.g. 1000"
                  value={form.budget}
                  onChange={handleChange}
                />
              </Field.Root>

              {/* Product Name */}
              <Field.Root>
                <Field.Label>Product Name</Field.Label>
                <Input
                  name="productName"
                  placeholder="e.g. SuperWidget 3000"
                  value={form.productName}
                  onChange={handleChange}
                />
              </Field.Root>

              {/* Description */}
              <Field.Root>
                <Field.Label>Description</Field.Label>
                <Textarea
                  name="description"
                  placeholder="Briefly describe your product"
                  value={form.description}
                  onChange={(e) =>
                    handleChange(e as React.ChangeEvent<HTMLTextAreaElement>)
                  }
                />
              </Field.Root>

              {/* Media URL (optional) */}
              <Field.Root>
                <Field.Label>Media (optional)</Field.Label>
                <Input
                  name="mediaUrl"
                  placeholder="https://… (image or video link)"
                  value={form.mediaUrl}
                  // onChange={handleChange}
                  type="file"
                />
              </Field.Root>

              {/* Target Audience */}
              <Field.Root>
                <Field.Label>Target Audience</Field.Label>
                <Input
                  name="targetAudience"
                  placeholder="e.g. Small business owners"
                  value={form.targetAudience}
                  onChange={handleChange}
                />
              </Field.Root>

              {/* Product Price */}
              <Field.Root>
                <Field.Label>Product Price (USD)</Field.Label>
                <Input
                  name="productPrice"
                  type="number"
                  placeholder="e.g. 49.99"
                  value={form.productPrice}
                  onChange={handleChange}
                />
              </Field.Root>
            </Fieldset.Content>

            <Button type="submit" mt={4} colorScheme="blue" w="full">
              Submit
            </Button>
          </Fieldset.Root>
        </Box>
      </Flex>
    </>
  );
}
