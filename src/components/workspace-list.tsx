"use client"

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loading } from "@/components/ui/loading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Info, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react"

interface Project {
  id: string;
  name: string;
  path?: string;
  conversationCount: number;
  lastModified: string;
}

export function WorkspaceList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/workspaces')
        const data = await response.json()
        setProjects(data || [])
      } catch (error) {
        console.error('Failed to fetch projects:', error)
        setProjects([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (isLoading) {
    return <Loading message="Loading projects..." />
  }

  const byLastModified = (a: Project, b: Project) => {
    const diff = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
    return sortOrder === 'desc' ? -diff : diff
  }
  const projectsWithConversations = projects
    .filter(project => project.conversationCount > 0)
    .sort(byLastModified)
  const projectsWithoutConversations = projects
    .filter(project => project.conversationCount === 0)
    .sort(byLastModified)

  return (
    <div className="space-y-8">
      {projects.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            title="Toggle sort by last modified time"
          >
            {sortOrder === 'desc' ? (
              <ArrowDownWideNarrow className="w-4 h-4" />
            ) : (
              <ArrowUpWideNarrow className="w-4 h-4" />
            )}
            Last modified: {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
          </Button>
        </div>
      )}

      {/* Projects with conversations */}
      {projectsWithConversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects with Conversations</CardTitle>
            <CardDescription>
              {projectsWithConversations.length} project{projectsWithConversations.length !== 1 ? 's' : ''} with chat history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Last Modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsWithConversations.map((project) => (
                  <TableRow key={project.id} className="hover:bg-accent/50">
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/workspace/${project.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {project.name}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[60vw] break-all">
                          {project.path}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        {project.conversationCount} conversation{project.conversationCount !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(project.lastModified), 'PPp')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Projects without conversations */}
      {projectsWithoutConversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projects without Conversations</CardTitle>
            <CardDescription>
              {projectsWithoutConversations.length} project{projectsWithoutConversations.length !== 1 ? 's' : ''} with no chat history found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                These projects may appear empty due to folder relocation, Cursor updates, or conversations being stored in a different location.
                You can still click on a project to check if there are any legacy conversations available.
              </AlertDescription>
            </Alert>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Last Modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsWithoutConversations.map((project) => (
                  <TableRow key={project.id} className="hover:bg-accent/50">
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/workspace/${project.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {project.name}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[60vw] break-all">
                          {project.path}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400">0</span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(project.lastModified), 'PPp')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* No projects found */}
      {projects.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Projects Found</CardTitle>
            <CardDescription>
              No Cursor workspace projects were found in the configured location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This could be due to an incorrect workspace path configuration or no Cursor projects being available.
                Check the configuration page to verify your Cursor workspace storage location.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}