export interface Episode {
    _id: string | number;
    title: string;
    episodeNumber: number;
    season: number;
    seriesId?: string | number;
    url: string;
    servers: Server[];
    createdAt?: string;
}

export interface Series {
    _id: string | number;
    title: string;
    description: string;
    imageURL: string;
    backdrop: string;
    genre: string;
    releaseDate: string;
    status: string;
    rating: number;
    totalEpisodes: number;
    createdAt?: string;
    episodes?: Episode[];
}

export interface Server {
    name: string;
    url: string;
}

export interface ServerLink {
    name: string;
    url: string;
}
