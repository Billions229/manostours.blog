import { NextRequest, NextResponse } from 'next/server'
import { allBlogs } from 'contentlayer/generated'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const limit = parseInt(searchParams.get('limit') || '10')
    const minCount = parseInt(searchParams.get('minCount') || '1')
    const sortBy = searchParams.get('sortBy') || 'count' // count, name, recent
    const includeStats = searchParams.get('includeStats') === 'true'

    console.log(
      `API Tags Call: locale=${locale}, limit=${limit}, minCount=${minCount}, sortBy=${sortBy}`
    )

    // Filtrer les articles par langue
    const localePosts = allBlogs.filter((post) => post.language === locale && post.draft !== true)

    // Compter les tags avec métadonnées enrichies
    const tagData: Record<
      string,
      {
        count: number
        posts: Array<{
          slug: string
          title: string
          date: string
          featured: boolean
        }>
        lastUsed: string
        featuredCount: number
      }
    > = {}

    localePosts.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((tag) => {
          if (!tagData[tag]) {
            tagData[tag] = {
              count: 0,
              posts: [],
              lastUsed: post.date,
              featuredCount: 0,
            }
          }

          tagData[tag].count++
          tagData[tag].posts.push({
            slug: post.slug,
            title: post.title,
            date: post.date,
            featured: post.featured || false,
          })

          if (post.featured) {
            tagData[tag].featuredCount++
          }

          // Mettre à jour la date de dernière utilisation
          if (new Date(post.date) > new Date(tagData[tag].lastUsed)) {
            tagData[tag].lastUsed = post.date
          }
        })
      }
    })

    // Filtrer par nombre minimum d'occurrences
    const filteredTags = Object.entries(tagData).filter(([, data]) => data.count >= minCount)

    // Fonction de tri
    const sortTags = (tags: typeof filteredTags) => {
      return tags.sort(([tagA, dataA], [tagB, dataB]) => {
        switch (sortBy) {
          case 'name':
            return tagA.localeCompare(tagB)
          case 'recent':
            return new Date(dataB.lastUsed).getTime() - new Date(dataA.lastUsed).getTime()
          case 'count':
          default:
            return dataB.count - dataA.count
        }
      })
    }

    // Trier et limiter
    const sortedTags = sortTags(filteredTags).slice(0, limit)

    // Mapper les données pour l'API
    const tags = sortedTags.map(([tag, data]) => ({
      tag,
      count: data.count,
      featuredCount: data.featuredCount,
      lastUsed: data.lastUsed,
      ...(includeStats && {
        posts: data.posts.slice(0, 3), // Limiter à 3 posts récents par tag
        averageWordsPerPost: Math.round(
          data.posts.reduce((acc, post) => {
            const fullPost = localePosts.find((p) => p.slug === post.slug)
            return acc + (fullPost?.readingTime?.words || 0)
          }, 0) / data.posts.length
        ),
      }),
    }))

    // Statistiques globales
    const globalStats = {
      totalTags: Object.keys(tagData).length,
      totalTaggedPosts: localePosts.filter((p) => p.tags && p.tags.length > 0).length,
      averageTagsPerPost:
        Math.round(
          (localePosts.reduce((acc, p) => acc + (p.tags?.length || 0), 0) / localePosts.length) *
            100
        ) / 100,
      mostPopularTag: sortedTags[0]
        ? {
            tag: sortedTags[0][0],
            count: sortedTags[0][1].count,
          }
        : null,
      tagDistribution: {
        single: localePosts.filter((p) => p.tags?.length === 1).length,
        multiple: localePosts.filter((p) => (p.tags?.length || 0) > 1).length,
        none: localePosts.filter((p) => !p.tags || p.tags.length === 0).length,
      },
    }

    return NextResponse.json({
      tags,
      stats: globalStats,
      filters: {
        locale,
        minCount,
        sortBy,
        includeStats,
      },
      pagination: {
        total: filteredTags.length,
        limit,
        returned: tags.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erreur API tags:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des tags',
        tags: [],
        stats: null,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
