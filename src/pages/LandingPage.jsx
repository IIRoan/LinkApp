import React from 'react';
import { Link } from 'react-router-dom';
import { Flex, Box, Heading, Text, Button, Card, Container, Grid, Section } from '@radix-ui/themes';
import { Link2Icon, PersonIcon, ColorWheelIcon, RocketIcon, CheckIcon } from '@radix-ui/react-icons';

const FeatureCard = ({ icon, title, description }) => (
  <Card size="2">
    <Flex direction="column" gap="2" align="center" style={{ textAlign: 'center', height: '100%' }}>
      <Box style={{ color: 'var(--accent-9)', fontSize: '2rem' }}>{icon}</Box>
      <Heading size="3">{title}</Heading>
      <Text size="2" style={{ color: 'var(--gray-11)', flexGrow: 1 }}>{description}</Text>
    </Flex>
  </Card>
);

const PricingTable = () => (
  <Card size="2" style={{ width: '100%', maxWidth: '400px' }}>
    <Flex direction="column" gap="4">
      <Box>
        <Heading size="6" style={{ textAlign: 'center' }}>Free Plan</Heading>
        <Text size="8" weight="bold" style={{ textAlign: 'center' }}>$0<Text size="2">/month</Text></Text>
      </Box>
      <Box>
        {[
          'Unlimited Links',
          'Custom URL',
          'Profile Customization',
          'Dark Mode',
          'Secure Authentication',
          'Analytics Dashboard (coming soon)'
        ].map((feature, index) => (
          <Flex key={index} align="center" gap="2" style={{ marginBottom: '0.5rem' }}>
            <CheckIcon style={{ color: 'var(--accent-9)' }} />
            <Text size="2">{feature}</Text>
          </Flex>
        ))}
      </Box>
      <Button size="3" style={{ width: '100%' }} asChild>
        <Link to="/auth">Get Started for Free</Link>
      </Button>
    </Flex>
  </Card>
);

export default function LandingPage() {
  return (
    <Box style={{ paddingTop: '1rem' }}>
      <Section size="3" style={{ background: 'var(--accent-3)', paddingTop: '6rem', paddingBottom: '6rem' }}>
        <Container size="3">
          <Flex direction="column" align="center" gap="6">
            <Heading size="9" align="center">Welcome to LinkApp</Heading>
            <Text size="5" align="center" style={{ maxWidth: '600px' }}>
              Your all-in-one platform for creating and sharing personalized link pages.
            </Text>
            <Button size="4" asChild>
              <Link to="/auth">Get Started for Free</Link>
            </Button>
          </Flex>
        </Container>
      </Section>

      <Section size="3">
        <Container size="3">
          <Flex direction="column" gap="8">
            <Heading size="8" align="center">Key Features</Heading>
            <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
              <FeatureCard 
                icon={<Link2Icon />}
                title="Custom URL"
                description="Create a personalized page with your own unique URL"
              />
              <FeatureCard 
                icon={<PersonIcon />}
                title="Profile Customization"
                description="Add a profile picture and description to make your page stand out"
              />
              <FeatureCard 
                icon={<ColorWheelIcon />}
                title="Easy Interface"
                description="User-friendly design with dark mode support"
              />
              <FeatureCard 
                icon={<RocketIcon />}
                title="Quick Setup"
                description="Get started in minutes and share your links with the world"
              />
            </Grid>
          </Flex>
        </Container>
      </Section>

      <Section size="3" style={{ background: 'var(--accent-3)' }}>
        <Container size="3">
          <Flex direction="column" align="center" gap="6">
            <Heading size="8" align="center">Free for Everyone</Heading>
            <PricingTable />
          </Flex>
        </Container>
      </Section>

    </Box>
  );
}
