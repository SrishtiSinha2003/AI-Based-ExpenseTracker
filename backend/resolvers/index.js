import { mergeResolvers } from "@graphql-tools/merge";
import userResolver from "./user.resolver.js";
import transactionResolver from "./transaction.resolver.js";
import notificationResolver from "./notification.resolver.js";

const mergedResolvers = mergeResolvers([userResolver, transactionResolver, notificationResolver]);

export default mergedResolvers;
