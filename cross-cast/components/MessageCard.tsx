'use client';

import { GenericPost, Origin } from '@/types/all';
import { Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Flex,
  Avatar,
  Box,
  Image,
  Heading,
  Button,
  HStack,
} from '@chakra-ui/react';
import Reaction from './Reaction';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkGithub from 'remark-github'
import './MessageCard.style.css';

export default function MessageCard(props: { post: GenericPost }) {
  const gitRepository = props.post.origin === Origin.GitHub ? props.post.url.split('/').slice(3,5).join('/'): '';
  const date = new Date(props.post.date);

  return (
    <Card id='pointed' mb='1.5em' width={[ '280px', '420px', 'lg', 'xl' ]}>
      {props.post.title && (
        <CardHeader>
          <Text as='h2'>{props.post.title}</Text>
        </CardHeader>
      )}
      <CardBody>
        <span className='overwriteChakra'>
          {
            props.post.origin === Origin.GitHub
            ? <ReactMarkdown remarkPlugins={[remarkGfm, [remarkGithub, { repository: gitRepository }]]}>{props.post.content}</ReactMarkdown>
            : <ReactMarkdown remarkPlugins={[remarkGfm]}>{props.post.content}</ReactMarkdown>
          }
        </span>
        {props.post.image && (
          <Image
            objectFit='cover'
            src={props.post.image}
            alt={props.post.author.name}
          />
        )}

        <HStack mt="5" spacing='10px'>
          {
            // GitHub + Slack?
            props.post.reactions
              .filter(reaction => reaction.icon !== 'url' && reaction.icon !== 'total_count' && reaction.numInteractions !== 0)
              .sort((reaction1, reaction2) => reaction2.numInteractions - reaction1.numInteractions)
              .slice(0, 5)
              .map((reaction, index) => {
                return <Reaction icon={reaction.icon} numInteractions={reaction.numInteractions} key={index} />;
              })
          }
        </HStack>
      </CardBody>
          <hr></hr>
      <CardFooter
        justify='space-between'
        flexWrap='wrap'
      >
        <Flex flex='1' gap='4' alignItems='center' justifyContent='space-between'>
          <a href={props.post.author.url} style={{ textDecoration: 'none' }}>
            <Flex alignItems='center' gap='3'>
              <Avatar name={props.post.author.name} size='md' src={props.post.author.avatar} />
              {/* TODO: Maybe sm instead? */}
              <Text>{props.post.author.name}</Text>
            </Flex>
          </a>
          <span>{`${String(date.getHours() % 12 === 0 ? 12 : date.getHours() % 12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")} ${date.getHours() / 12 >= 1 ? 'PM' : 'AM'}`}</span>
        </Flex>
      </CardFooter>
    </Card>
  );
}
