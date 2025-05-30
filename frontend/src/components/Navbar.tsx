//@ts-nocheck
import React from "react";
import { Box, Flex, Heading, HStack, Button, Link } from "@chakra-ui/react";
import { useEnsureUser } from "@/hooks/useEnsureUser";
import { useUser } from "@auth0/nextjs-auth0";
export default function Navbar() {
  // Ensure user is authenticated
  // useEnsureUser();
  const { user, isLoading } = useUser();
  return (
    <Box bg="grey.600" px={6} py={4} boxShadow="md">
      <Flex
        maxW="5xl"
        mx="auto"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading size="lg" color="white">
          MarketGenie
        </Heading>
        <HStack spacing={6}>
          <Link href="/" fontWeight="bold" color="white" mx={2}>
            Home
          </Link>
          <Link href="/create-campaign" fontWeight="bold" color="white" mx={2}>
            Create Campaign
          </Link>

          {user ? (
            <Button
              as="a"
              href="/auth/logout"
              size="sm"
              colorScheme="teal"
              variant="solid"
              mx={2}
            >
              Logout
            </Button>
          ) : (
            <Button
              as="a"
              href="/auth/login"
              size="sm"
              colorScheme="teal"
              variant="solid"
              mx={2}
            >
              Login
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}
