import xlg from "../xlogger";
import { Message, MessageEmbed, MessageEmbedOptions, MessageReaction, User } from "discord.js";

interface PagerEntry {
    /**
     * The message id
     */
    id: string;
    pages: MessageEmbed[];
    currentPageNumber: number;
    currentPage: MessageEmbed;
    controllers?: string[];
    closeable?: boolean;
}

interface CloserEntry {
    id: string;
    emoji: string;
}

// export class PagerEntry {
//     /**
//      * The message id
//      */
//     id: string;
//     pages: MessageEmbed[];
//     currentPageNumber: number;
//     currentPage: MessageEmbed;
//     public message: Message;

//     constructor() {}
// }

export class PaginationExecutor {
    private static pagers: PagerEntry[] = [];
    private static closers: CloserEntry[] = [];
    public static emojiLeft = "◀";
    public static emojiRight = "▶";
    public static closeEmoji = "❌";

    public static async createEmbed(message: Message, embeds: MessageEmbedOptions[] | MessageEmbed[], controllers?: string[], closeable = false): Promise<boolean> {
        try {
            if (!embeds.length) return false;

            const preexisting = this.pagers.find(x => x.id === message.id);
            if (preexisting) {
                this.pagers.splice(this.pagers.indexOf(preexisting));
            }
            const pages: MessageEmbed[] = [];
            for (const embed of embeds) {
                if (!(embed instanceof MessageEmbed)) {
                    pages.push(new MessageEmbed(embed));
                    continue;
                }
                pages.push(embed);
            }
            if (pages.length < 2) {
                await message.channel.send(pages[0]);
            } else {
                const p = new MessageEmbed(pages[0]);
                const current = await message.channel.send(p.setFooter(`1 of ${pages.length}${p.footer?.text ? ` | ${p.footer.text}` : ""}`));
                await current.react(this.emojiLeft);
                await current.react(this.emojiRight);
                if (closeable) {
                    await current.react(this.closeEmoji);
                }
                this.pagers.push({
                    id: current.id,
                    pages: pages,
                    currentPageNumber: 0,
                    currentPage: pages[0],
                    controllers: controllers ? controllers : undefined,
                    closeable: closeable
                });
            }
            return true;
        } catch (error) {
            xlg.error(error);
            return false;
        }
    }

    public static async paginate(reaction: MessageReaction, user: User): Promise<void> {
        try {
            if (reaction.message.author.id !== reaction.message.client.user?.id || user.id === reaction.message.client.user?.id) return;
            if (reaction.emoji.name !== this.emojiLeft && reaction.emoji.name !== this.emojiRight && reaction.emoji.name !== this.closeEmoji) return;
            const pager = this.pagers.find(x => x.id === reaction.message.id);
            if (reaction.emoji.name === this.closeEmoji) {
                const closer = this.closers.find(x => x.id === reaction.message.id);
                if (closer || (pager && pager.closeable)) {
                    if (pager) {
                        this.pagers.splice(this.pagers.indexOf(pager), 1);
                    }
                    if (closer) {
                        this.closers.splice(this.closers.indexOf(closer), 1);
                    }
                    if (reaction.message.deletable) {
                        await reaction.message.delete();
                        return;
                    }
                }
            }
            if (!pager) return;
            if (pager.controllers && !pager.controllers.includes(user.id)) return;
            const direction = reaction.emoji.name === this.emojiLeft ? -1 : 1;
            pager.currentPageNumber = (pager.currentPageNumber + direction) > -1 ? (pager.currentPageNumber + direction) % pager.pages.length : pager.pages.length - 1;
            const p = new MessageEmbed(pager.pages[pager.currentPageNumber]);
            if (reaction.message.editable) {
                await reaction.message.edit(p.setFooter(`${pager.currentPageNumber + 1} of ${pager.pages.length}${p.footer?.text ? ` | ${p.footer.text}` : ""}`));
            }
            await reaction.users.remove(user);
        } catch (error) {
            xlg.error(error);
        }
    }

    public static async addCloseListener(message: Message, reaction = this.closeEmoji): Promise<boolean> {
        try {
            const preexisting = this.closers.find(x => x.id === message.id);
            if (preexisting) {
                this.closers.splice(this.closers.indexOf(preexisting));
            }
            await message.react(reaction);
            this.closers.push({
                id: message.id,
                emoji: reaction
            });
            return true;
        } catch (error) {
            xlg.error(error);
            return false;
        }
    }
}